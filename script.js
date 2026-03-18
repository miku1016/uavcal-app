document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const modelSelect = document.getElementById('model');
    const altitudeInput = document.getElementById('altitude');
    const overlapInput = document.getElementById('overlap');
    const sidelapInput = document.getElementById('sidelap');
    const intervalInput = document.getElementById('interval');
    const calculateButton = document.getElementById('calculateButton');

    const flightSpeedSpan = document.getElementById('flightSpeed');
    const flightRouteSpacingSpan = document.getElementById('flightRouteSpacing');
    const horizontalSizeSpan = document.getElementById('horizontalSize');
    const verticalSizeSpan = document.getElementById('verticalSize');
    const gsdSpan = document.getElementById('gsd');

    // 機種データを複数定義
    const uavData = {
        "Mini4 pro 4800(4:3)": {
            horizontalPixels: 8604,
            verticalPixels: 6048,
            horizontalSensorSize: 9.9, // mm
            verticalSensorSize: 7.4,  // mm
            focalLength: 7           // mm (焦点距離と仮定)
        },
        "DJI Mavic 3 (4:3)": { 
            horizontalPixels: 5280,
            verticalPixels: 3956,
            horizontalSensorSize: 13.2, 
            verticalSensorSize: 9.9,  
            focalLength: 24          
        },
        "Phantom 4 Pro (3:2)": { 
            horizontalPixels: 5472,
            verticalPixels: 3648,
            horizontalSensorSize: 13.2, 
            verticalSensorSize: 8.8,  
            focalLength: 8.8          
        }
    };

    // プルダウンメニューに機種オプションを動的に追加する関数
    function populateModelSelect() {
        for (const modelName in uavData) {
            const option = document.createElement('option');
            option.value = modelName;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        }
    }

    // 計算関数
    function calculateUAVParameters() {
        const selectedModel = modelSelect.value;
        const altitude = parseFloat(altitudeInput.value); // m
        const overlap = parseFloat(overlapInput.value) / 100; // % -> decimal
        const sidelap = parseFloat(sidelapInput.value) / 100; // % -> decimal
        const interval = parseFloat(intervalInput.value); // s

        const data = uavData[selectedModel];

        if (!data || isNaN(altitude) || isNaN(overlap) || isNaN(sidelap) || isNaN(interval) || altitude <= 0) {
            alert("全ての項目を正しく入力してください。");
            // 入力が不正な場合は結果をクリア（小数点の位置を揃えるため 0.00 に設定）
            flightSpeedSpan.textContent = '0.00';
            flightRouteSpacingSpan.textContent = '0.00';
            horizontalSizeSpan.textContent = '0.00';
            verticalSizeSpan.textContent = '0.00';
            gsdSpan.textContent = '0.00';
            return;
        }

        const { horizontalPixels, verticalPixels, horizontalSensorSize, verticalSensorSize, focalLength } = data;

        // 地上画素サイズ (GSD) 計算 (cm/pix)
        const gsdHorizontal_m_per_pix = (horizontalSensorSize / 1000) * altitude / (focalLength / 1000) / horizontalPixels; 
        const gsd_cm_per_pix = gsdHorizontal_m_per_pix * 100; 
        
        // 地上での水平・垂直撮影範囲 (FOV) 計算 (m)
        const horizontalFov_m = gsdHorizontal_m_per_pix * horizontalPixels;
        const verticalFov_m = (verticalSensorSize / 1000) * altitude / (focalLength / 1000); 

        // 飛行速度 (m/s)
        const flightSpeed = (horizontalFov_m * (1 - overlap)) / interval;

        // 飛行ルート間隔 (m)
        const flightRouteSpacing = verticalFov_m * (1 - sidelap);

        // 結果をDOMに表示
        flightSpeedSpan.textContent = flightSpeed.toFixed(2);
        flightRouteSpacingSpan.textContent = flightRouteSpacing.toFixed(2);
        horizontalSizeSpan.textContent = horizontalFov_m.toFixed(2);
        verticalSizeSpan.textContent = verticalFov_m.toFixed(2);
        gsdSpan.textContent = gsd_cm_per_pix.toFixed(2);
    }

    // ページロード時にプルダウンを生成
    populateModelSelect();

    // 計算ボタンクリック時のイベントリスナー
    calculateButton.addEventListener('click', calculateUAVParameters);

    // 機種選択、入力値変更時にリアルタイムで更新
    modelSelect.addEventListener('change', calculateUAVParameters);
    altitudeInput.addEventListener('input', calculateUAVParameters);
    // 【修正】calculateUavParameters -> calculateUAVParameters のタイポを修正
    overlapInput.addEventListener('input', calculateUAVParameters); 
    sidelapInput.addEventListener('input', calculateUAVParameters);
    intervalInput.addEventListener('input', calculateUAVParameters);

    // 初期表示として一度計算を実行
    calculateUAVParameters();
});