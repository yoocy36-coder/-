// ==UserScript==
// @name         厦门工学院-稳定挂机防掉线(V8.0)
// @namespace    https://github.com/your-username/xit-auto-study
// @version      8.0
// @description  厦门工学院实验室安全培训，自动点击弹窗，防止挂机掉线。注：系统采用服务器真实计时，无法秒刷。
// @author       YourName
// @match        *://exam.xit.edu.cn/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    let confirmCount = 0;

    // 1. 拦截原生 confirm 弹窗，直接返回 true
    window.confirm = function(message) {
        confirmCount++;
        updateUI();
        console.log(`[${new Date().toLocaleTimeString()}] 🖱️ 自动点击了弹窗 [确定] (${message})`);
        return true;
    };

    // 2. 针对自定义 HTML 弹窗的点击
    function clickCustomModal() {
        const elements = document.querySelectorAll('button, a, div, span, input[type="button"]');
        for (let el of elements) {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            
            const text = (el.innerText || el.value || '').trim();
            if (el.id && el.id.includes('v8-')) continue;

            if (text === '确定' || text === '继续阅读' || text === '继续学习' || text === '我知道了') {
                const pClass = el.parentElement ? el.parentElement.className.toString() : '';
                if (pClass.includes('dialog') || pClass.includes('modal') || pClass.includes('layer') || el.tagName === 'BUTTON') {
                    el.click();
                    confirmCount++;
                    updateUI();
                    console.log(`[${new Date().toLocaleTimeString()}] 🖱️ 自动点击了页面按钮: [${text}]`);
                    return;
                }
            }
        }
    }

    // 3. UI 面板与状态更新
    function updateUI() {
        const countEl = document.getElementById('v8-count');
        if (countEl) countEl.innerText = confirmCount;
        const timeEl = document.getElementById('v8-last-time');
        if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();
    }

    function createUI() {
        let oldUI = document.getElementById('auto-read-ui');
        if (oldUI) oldUI.remove();

        const uiDiv = document.createElement('div');
        uiDiv.id = 'auto-read-ui';
        uiDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; width: 230px;
            background-color: rgba(30, 30, 30, 0.9); color: #fff; border-radius: 8px;
            padding: 12px; font-family: Arial, sans-serif; font-size: 13px;
            z-index: 999999; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid #444;
        `;
        uiDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; border-bottom: 1px solid #555; padding-bottom: 5px;">
                <span style="font-weight:bold; color:#4CAF50;">🛡️ 稳定挂机保护中</span>
                <span id="hide-ui-btn" style="cursor:pointer; color:#aaa;" title="隐藏面板">✖</span>
            </div>
            <div style="margin-bottom: 4px;">自动确认弹窗: <span id="v8-count" style="color:#FFC107;">0</span> 次</div>
            <div style="margin-bottom: 8px; font-size: 11px; color: #aaa;">最后检查: <span id="v8-last-time">--:--:--</span></div>
            <div style="font-size: 11px; color: #ff5252; line-height: 1.3;">
                ⚠️ 提示：系统采用服务器真实计时，无法秒刷。请保持页面不要关闭，并保持电脑不休眠。
            </div>
        `;
        document.body.appendChild(uiDiv);

        document.getElementById('hide-ui-btn').onclick = () => uiDiv.style.display = 'none';
    }

    setTimeout(createUI, 1000);

    setInterval(() => {
        clickCustomModal();
        const timeEl = document.getElementById('v8-last-time');
        if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();
    }, 3000);

    console.log("🛡️ [稳定挂机版 V8.0] 已启动，老老实实帮你点弹窗，绝不乱发请求。");

})();
