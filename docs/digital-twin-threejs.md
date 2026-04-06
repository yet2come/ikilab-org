# 壱岐島 3D ワイヤーフレーム — Three.js 技術解説

`public/digital-twin-app/index.html` の実装解説。CDN経由の Three.js r149 を使い、単一HTMLファイルで完結する3D地図ビューア。

---

## 全体構成

```
HTML/CSS（UI）
  └─ <script>
       ├─ データ定数（海岸線・道路・標高・拠点）
       ├─ パーサー（parseCoast, parseRoads）
       ├─ 座標変換・標高補間（geo, getElev, inside）
       ├─ シーン構築（build* 関数群）
       ├─ カメラ操作（setupOrbit）
       ├─ UI制御（setupUI, updateLayers）
       ├─ メモリ管理（disposeGroup, rebuildAll）
       └─ アニメーションループ（animate）
```

---

## 1. 座標系

### geo(lat, lng) → [x, z]

緯度経度を Three.js のワールド座標に変換する。

```
x = (lng - 129.71) × cos(33.79° × π/180) × 600
z = -(lat - 33.79) × 600
```

- **中心点**: 北緯33.79度、東経129.71度（壱岐島のほぼ中心）
- **スケール係数**: 600（経度1度 ≈ 600ユニット）
- **メルカトル補正**: `cos(33.79°)` で緯度による経度の縮みを補正
- **Z軸反転**: 北が画面奥（-Z方向）になるよう反転

### 標高 (Y軸)

```
y = (実標高 / ELEV_MAX) × exagVal
```

- `ELEV_MAX` = グリッド内の実測最大標高（約150.5m）
- `exagVal` = 標高強調倍率（デフォルト8、スライダーで1〜20）
- 実際の最高地点が Y=8 ユニットになるようスケーリング

---

## 2. 標高データと補間

### データ構造

国土地理院 標高APIから取得した 31×31 グリッド。

```
範囲: lat 33.700〜33.865, lng 129.638〜129.795
格納: ELEV_GRID[行][列]（南→北、西→東）
```

### getElev(lat, lng) — 双線形補間

任意地点の標高を、周囲4グリッド点から双線形補間で算出。

```
                j0     j1
          ┌──────┬──────┐
    i0    │ v00  │ v01  │
          ├──────┼──────┤
    i1    │ v10  │ v11  │
          └──────┴──────┘

elev = v00×(1-di)×(1-dj) + v10×di×(1-dj) + v01×(1-di)×dj + v11×di×dj
```

### inside(lat, lng) — 海岸線内判定

Ray casting 法で海岸線ポリゴンの内外判定。海上の格子点では標高0を返す。

---

## 3. レイヤー構築

### 3.1 海岸線 — buildCoastline()

- 壱岐本島: 441点の閉じたポリライン (`THREE.Line`)
- 二次離島: 10島それぞれ閉じたポリライン + 島名スプライトラベル
- 影線（半透明コピーを Y=-0.3 に配置）で立体感を演出
- **再構築対象外**: 標高変更の影響を受けないため `rebuildAll()` では再構築しない

### 3.2 地形メッシュ — buildTerrain()

65×65 の頂点グリッドからワイヤーフレームメッシュを生成。

```
1. 各格子点の (lat, lng) → geo() でワールド座標、getElev() で標高
2. inside() が false の格子点は標高0
3. 4頂点のうち1つでも inside なら三角形2枚（a-b-d, a-d-c）を生成
4. 頂点カラーは標高に応じたシアン系グラデーション
5. MeshBasicMaterial + wireframe: true で描画
```

**デフォルトOFF**: 等高線で地形は十分把握でき、メッシュは視覚的にノイジーなため。

### 3.3 離島地形 — buildIslandTerrain()

`ISLAND_ELEV` の各島ごとに小規模グリッド（3×3〜5×5）をワイヤーフレーム線で描画。行方向・列方向それぞれ `THREE.Line` を生成。

### 3.4 等高線 — buildContours()

マーチングスクエア法で本島+離島の等高線を一括生成。

```
marchGrid() ヘルパー:
  1. 標高グリッドの各セル（2×2頂点）について
  2. 4頂点のうちどれが閾値(level)以上かを4ビットコード化
  3. ルックアップテーブルからエッジ上の交点を線形補間で算出
  4. サドルポイント（case 5, 10）は2本の線分を出力
  5. 全セグメントを levelSegments[level] に収集
```

**バッチ描画**: レベルごとに1つの `THREE.LineSegments` に統合。数千の個別 Line を十数個の LineSegments に削減。

**50m間隔ラベル**: 主要等高線にはキャンバスで生成したスプライトテキストを配置。

### 3.5 幹線道路 — buildRoads()

道路種別（国道/主要/二次/三次）ごとに色・透明度を変えて描画。

```
各道路セグメント:
  1. 各点の (lat, lng) → ワールド座標 + getElev() で地形に沿った高さ
  2. CatmullRomCurve3 で平滑化（3点以上の場合）
  3. 連続する頂点ペアを種別ごとのバッファに収集
```

**バッチ描画**: 種別ごとに1つの `THREE.LineSegments`（計4オブジェクト）。

### 3.6 交通拠点 — buildHubs()

6拠点それぞれに3Dジオメトリ + 名前スプライト + 接地線を配置。

| type | ジオメトリ | 色 |
|---|---|---|
| port | OctahedronGeometry | ピンク |
| airport | ConeGeometry | 紫 |
| bus (その他) | SphereGeometry | 緑 |

- Raycaster でホバー検知 → ツールチップ表示
- ダブルクリックでスムーズズーム（60フレーム補間）

---

## 4. レイヤー制御

### updateLayers()

各グループの `visible` と `position.y` を `layerState` と `sepVal` に基づいて更新。

```
海岸線:   y = -s × 0.5
等高線:   y =  s × 0.4
地形:     y =  0
道路:     y =  s × 0.8
拠点:     y =  s × 1.6
```

`sepVal = 0`（デフォルト）では全レイヤーが同一平面に重なる。スライダーで分離すると爆発図のように各レイヤーが上下に分かれる。

### rebuildAll()

標高強調倍率やコンテンツ間隔の変更時に呼ばれる。`disposeGroup()` で旧オブジェクトの Geometry / Material / Texture を解放してから再構築。

---

## 5. カメラ

### 軌道制御 — setupOrbit()

独自実装のオービットカメラ（THREE.OrbitControls は使用していない）。

```
球面座標:
  x = tx + radius × sin(phi) × sin(theta)
  y = ty + radius × cos(phi)
  z = tz + radius × sin(phi) × cos(theta)

操作:
  左ドラッグ → theta, phi を変更（回転）
  右ドラッグ → tx, tz を変更（パン）
  ホイール   → radius を変更（ズーム）
  タッチ     → 1本指で回転、2本指でピンチズーム
```

### 慣性

ドラッグ中は速度変数 `vTheta`, `vPhi` に値をセット。`animate()` ループで摩擦 0.95 を乗じて減衰適用。

### ダブルクリックズーム

Raycaster で拠点メッシュにヒットした場合、60フレームかけて `radius=40` まで easeInOutQuad で補間。

---

## 6. 海面アニメーション

`initThree()` で `PlaneGeometry(200, 200, 30, 30)` を生成し、`animate()` ループ内で頂点を波形変形。

```javascript
y = sin(x × 0.05 + t) × 0.3 + cos(z × 0.04 + t × 0.7) × 0.2 - 0.5
```

2種類の波を重ね合わせることで単調さを回避。

---

## 7. メモリ管理

### disposeGroup(group)

```
group.traverse():
  - geometry → dispose()
  - material.map (テクスチャ) → dispose()
  - material → dispose()
scene.remove(group)
```

`rebuildAll()` と等高線間隔変更時に呼び出し、GPU メモリの確実な解放を保証。

---

## 8. 外部連携

### クエリパラメータ

| パラメータ | 効果 |
|---|---|
| `?embed` | ヘッダー・パネル・ヒントを非表示 |
| `?autorotate` | カメラが自動回転（慣性無効） |
| `?layers=roads,coastline,...` | 指定レイヤーのみ表示 |

### postMessage

親ウィンドウから `{ type: 'keydown', key: '1' }` 形式のメッセージを受信し、キーボードショートカットと同じハンドラで処理。専用ページ (`/digital-twin`) がこの仕組みで iframe 内にキー操作を転送する。

### キーボードショートカット

| キー | 動作 |
|---|---|
| `1`〜`5` | レイヤー切替（地形/道路/拠点/等高線/海岸線） |
| `R` | 全設定をデフォルトにリセット |

---

## 9. Three.js バージョンについて

**r149** を使用。これはグローバル `THREE` オブジェクトを提供する `three.min.js`（UMDビルド）が利用できる最終バージョン。r150 以降は ES Modules 専用となり、CDN の `three.min.js` は非推奨警告のみを出力する。

単一HTMLファイルで完結する設計のため、ビルドツール不要で `<script src="...">` で読み込める UMD 版が最適。ES Modules への移行はコードが肥大化して保守が困難になった段階で検討する。
