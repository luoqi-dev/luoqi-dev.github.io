// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package.
const bundled = require('node:path').join(require('node:os').homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || (require('node:fs').existsSync(bundled) ? bundled : 'playwright'));
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = 'http://127.0.0.1:4173';
const output = path.resolve(__dirname, '../.preview-checks');
fs.mkdirSync(output, {recursive:true});
(async () => {
  const browser = await chromium.launch({channel:'chrome',headless:true});
  const findings = { viewports: [], checks: [], consoleErrors: [], externalFailures: [] };
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => findings.consoleErrors.push(error.message));
    page.on('console', message => {if(message.type() === 'error') findings.consoleErrors.push(message.text());});
    page.on('requestfailed', request => findings.externalFailures.push({url:request.url(),error:request.failure()?.errorText}));
    for (const width of [1440,1024,768,390]) {
      await page.setViewportSize({width,height:900});
      for (const file of ['index.html','projects.html']) {
        const response = await page.goto(`${base}/${file}`, {waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        await page.locator('footer').scrollIntoViewIfNeeded();
        await page.waitForTimeout(350);
        await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
        const layout = await page.evaluate(() => ({
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          brokenImages: [...document.images].filter(img => img.complete && !img.naturalWidth).map(img => img.src),
          sidebar: document.querySelector('.sidebar').getBoundingClientRect().width,
          sections: [...document.querySelectorAll('main > section')].map(s => s.id),
          duplicateIDs: [...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,index,ids)=>ids.indexOf(id)!==index)
        }));
        assert.ok(layout.scrollWidth <= width, `Overflow ${file} ${width}`);
        assert.deepEqual(layout.brokenImages, []);
        assert.deepEqual(layout.duplicateIDs, []);
        if(width>800) assert.equal(layout.sidebar,240);
        if(file==='index.html') assert.deepEqual(layout.sections,['about','projects','experience']);
        await page.screenshot({path:path.join(output,`${file.replace('.html','')}-${width}.png`),fullPage:true});
        findings.viewports.push({file,...layout});
      }
    }
    await page.setViewportSize({width:1440,height:900});
    await page.goto(`${base}/index.html`);
    assert.equal(await page.locator('.school-logo-gt').innerText(),'GT');
    assert.equal(await page.locator('a[href="#"]').count(),0);
    // Every local link and asset resolves, including fragment targets.
    const resources = await page.locator('a[href], img[src], script[src], link[href]').evaluateAll(elements => elements.map(e=>e.getAttribute('href') || e.getAttribute('src')));
    for(const resource of resources.filter(r=>r && !/^(https?:|mailto:)/.test(r))) {
      const url = new URL(resource, `${base}/index.html`);
      const response = await page.request.get(url.href.split('#')[0]);
      assert.equal(response.status(),200,resource);
      if(url.hash) {
        const html = await response.text();
        assert.ok(html.includes(`id="${url.hash.slice(1)}"`),`Missing target ${resource}`);
      }
    }
    findings.checks.push('Local links, anchors, assets, GT text fallback, no placeholder links');
    await page.locator('.section-nav a[href="#experience"]').click();
    const activeDuringScroll = [];
    for(let i=0;i<8;i++) { activeDuringScroll.push(await page.locator('.section-nav [aria-current]').getAttribute('href')); await page.waitForTimeout(75); }
    assert.ok(activeDuringScroll.every(href=>href==='#experience'), 'Highlight flickered');
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('.section-nav [aria-current]').getAttribute('href'),'#experience');
    await page.locator('.section-nav a[href="#projects"]').click();
    await page.waitForTimeout(1600);
    await page.goBack(); await page.waitForTimeout(250);
    assert.equal(await page.locator('.section-nav [aria-current]').getAttribute('href'),'#experience');
    await page.goForward(); await page.waitForTimeout(250);
    assert.equal(await page.locator('.section-nav [aria-current]').getAttribute('href'),'#projects');
    for(const hash of ['about','projects','experience','experiences']) {
      await page.goto(`${base}/index.html#${hash}`); await page.waitForTimeout(1600);
      assert.equal(await page.locator('.section-nav [aria-current]').getAttribute('href'),'#'+(hash==='experiences'?'experience':hash));
    }
    await page.goto(`${base}/projects.html#project-1`);
    await page.locator('.back-link').click(); await page.waitForTimeout(1600);
    assert.equal(await page.locator('.section-nav [aria-current]').getAttribute('href'),'#projects');
    await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})); await page.waitForTimeout(200);
    assert.equal(await page.locator('.section-nav [aria-current]').getAttribute('href'),'#experience');
    findings.checks.push('Smooth-scroll highlight lock, bottom highlight, direct anchors, legacy alias, back/forward, detail return');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
    await page.setViewportSize({width:1024,height:400});
    await page.goto(base);
    await page.locator('.social-links a').last().focus();
    await page.locator('.social-links a').last().scrollIntoViewIfNeeded();
    assert.ok(await page.locator('.social-links a').last().evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0 && r.bottom<=innerHeight;}));
    await page.screenshot({path:path.join(output,'short-screen.png')});
    await page.goto(base); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
    findings.checks.push('Reduced motion, keyboard skip link, short-screen sidebar links');
    const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await nojs.goto(`${base}/index.html#experiences`);
    assert.equal(await nojs.locator('.project-entry').count(),4);
    assert.ok(await nojs.locator('#experience').isVisible());
    assert.ok(await nojs.locator('.school-logo-gt').isVisible());
    await nojs.goto(`${base}/projects.html#project-1`);
    assert.ok(await nojs.locator('.project-detail').isVisible());
    findings.checks.push('No-JavaScript content, legacy anchor and detail page');
    // Intentionally simulate a missing project image to exercise the enhancement.
    await page.route('**/images/projects/legv8-cpu.svg', route=>route.fulfill({status:200,contentType:'image/svg+xml',body:'invalid image'}));
    await page.goto(base); await page.locator('.project-entry').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    assert.ok(await page.locator('.project-visual img').first().evaluate(e=>e.classList.contains('is-missing')));
    findings.checks.push('Missing project image fallback');
    fs.writeFileSync(path.join(output,'results.json'), JSON.stringify(findings,null,2));
    console.log(JSON.stringify(findings,null,2));
    assert.deepEqual(findings.consoleErrors,[], 'Browser console errors');
  } finally { await browser.close(); }
})().catch(error=>{ console.error(error); process.exitCode=1; });
