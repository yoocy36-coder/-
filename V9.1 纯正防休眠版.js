// ==UserScript==
// @name         厦门工学院-后台防节流保活(V9.1 纯正版)
// @namespace    https://github.com/your-username/xit-auto-study
// @version      9.1
// @description  破解浏览器后台休眠，绝不干扰原网页正常计时速率。
// @author       YourName
// @match        *://exam.xit.edu.cn/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    let confirmCount = 0;
    let isKeepAlive = false;
    let worker = null;
    let audioCtx = null;
    let audioSource = null;

    // 1. 拦截弹窗
    window.confirm = function(message) {
        confirmCount++;
        updateUI();
        console.log(`[${new Date().toLocaleTimeString()}] 🖱️ 拦截弹窗 [确定]`);
        return true;
    };

    function clickCustomModal() {
        const elements = document.querySelectorAll('button, a, div, span, input[type="button"]');
        for (let el of elements) {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            const text = (el.innerText || el.value || '').trim();
            if (el.id && el.id.includes('v9-')) continue;

            if (text === '确定' || text === '继续阅读' || text === '继续学习' || text === '我知道了') {
                const pClass = el.parentElement ? el.parentElement.className.toString() : '';
                if (pClass.includes('dialog') || pClass.includes('modal') || pClass.includes('layer') || el.tagName === 'BUTTON') {
                    el.click();
                    confirmCount++;
                    updateUI();
                    return;
                }
            }
        }
    }

    // 2. 核心：开启后台防休眠 (纯粹版)
    function startKeepAlive() {
        if (isKeepAlive) return;
        isKeepAlive = true;

        // Web Worker 仅用于维持心跳和检测弹窗，绝不干扰网页变量
        const workerCode = `
            let timer = null;
            self.onmessage = function(e) {
                if (e.data === 'start') {
                    timer = setInterval(() => {
                        self.postMessage('tick');
                    }, 1000);
                } else if (e.data === 'stop') {
                    clearInterval(timer);
                }
            };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        worker = new Worker(URL.createObjectURL(blob));

        worker.onmessage = function(e) {
            if (e.data === 'tick' && isKeepAlive) {
                // 只负责点击可能出现的弹窗，不碰计时器
                clickCustomModal();
                updateUI();
            }
        };
        worker.postMessage('start');

        // 开启静音音频欺骗浏览器
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioSource = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 0; // 静音
            audioSource.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            audioSource.start();
            console.log("🔊 静音音频保活已开启");
        } catch (error) {
            console.log("❌ 音频保活启动失败", error);
        }

        updateUI();
        console.log("🛡️ 后台防节流保活已启动，可安全最小化！(正常计时速率)");
    }

    function stopKeepAlive() {
        isKeepAlive = false;
        if (worker) {
            worker.postMessage('stop');
            worker.terminate();
            worker = null;
        }
        if (audioSource) {
            audioSource.stop();
            audioSource = null;
        }
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
        updateUI();
        console.log("🛑 后台保活已停止。");
    }

    // 3. UI 面板
    function updateUI() {
        const countEl = document.getElementById('v9-count');
        if (countEl) countEl.innerText = confirmCount;
        const timeEl = document.getElementById('v9-last-time');
        if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();
        
        const btn = document.getElementById('v9-toggle-btn');
        const status = document.getElementById('v9-status');
        if (btn && status) {
            if (isKeepAlive) {
                btn.innerText = "⏹ 停止后台保活";
                btn.style.background = "#f44336";
                status.innerText = "状态：🔒 深度保活中 (可最小化)";
                status.style.color = "#4CAF50";
            } else {
                btn.innerText = "🚀 开启后台防休眠";
                btn.style.background = "#2196F3";
                status.innerText = "状态：未开启 (最小化会暂停)";
                status.style.color = "#ff9800";
            }
        }
    }

    function createUI() {
        let oldUI = document.getElementById('auto-read-ui');
        if (oldUI) oldUI.remove();

        const uiDiv = document.createElement('div');
        uiDiv.id = 'auto-read-ui';
        uiDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; width: 250px;
            background-color: rgba(30, 30, 30, 0.95); color: #fff; border-radius: 8px;
            padding: 12px; font-family: Arial, sans-serif; font-size: 13px;
            z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 1px solid #444;
        `;
        uiDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; border-bottom: 1px solid #555; padding-bottom: 5px;">
                <span style="font-weight:bold; color:#4CAF50;">🛡️ 终极保活版 V9.1</span>
                <span id="hide-ui-btn" style="cursor:pointer; color:#aaa;" title="隐藏">✖</span>
            </div>
            <div style="margin-bottom: 6px;">自动确认弹窗: <span id="v9-count" style="color:#FFC107; font-weight:bold;">0</span> 次</div>
            <div style="margin-bottom: 8px; font-size: 11px; color: #aaa;">最后心跳: <span id="v9-last-time">--:--:--</span></div>
            
            <button id="v9-toggle-btn" style="width: 100%; padding: 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                🚀 开启后台防休眠
            </button>
            <div id="v9-status" style="font-size: 11px; color: #ff9800; margin-top: 8px; text-align: center; font-weight: bold;">
                状态：未开启 (最小化会暂停)
            </div>
            <div style="font-size: 11px; color: #ccc; margin-top: 6px; line-height: 1.3;">
                💡 开启后，浏览器会播放静音音频防止休眠。
            </div>
        `;
        document.body.appendChild(uiDiv);

        document.getElementById('hide-ui-btn').onclick = () => uiDiv.style.display = 'none';
        document.getElementById('v9-toggle-btn').onclick = () => {
            if (isKeepAlive) stopKeepAlive();
            else startKeepAlive();
        };
    }

    setTimeout(createUI, 1000);

    setInterval(() => {
        clickCustomModal();
        if (!isKeepAlive) updateUI();
    }, 3000);

})();