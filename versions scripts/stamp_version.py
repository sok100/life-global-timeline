    # ── 5. Regenerate versions.html (self-contained diagnostic page) ──
    # The template carries three placeholders; the manifest injected here is
    # built from the very banners stamped above (i.e. each file's line 1).
    tpl = ROOT / 'scripts' / 'versions.template.html'
    if tpl.exists():
        manifest_obj = {'app': m['app'], 'updated': today, 'files': m['files']}
        out = (tpl.read_text(encoding='utf-8')
               .replace('__APP_VERSION__', m['app'])
               .replace('__DATE__', today)
               .replace('/*__MANIFEST__*/null', json.dumps(manifest_obj, indent=2)))
        (DEMO / 'versions.html').write_text(out, encoding='utf-8')
        print('  ✓ versions.html → regenerated (demo/)')
    else:
        print('  ! scripts/versions.template.html missing — versions.html skipped')