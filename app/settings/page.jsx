'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import CustomDropdown from '../components/CustomDropdown';
import styles from './settings.module.css';

const LS_KEYS = {
    ACCENT: 'pref_accent',
    DENSITY: 'pref_density',
    CONTRAST: 'pref_contrast',
    MOTION: 'pref_motion',
    SIDEBAR: 'sidebar_collapsed',
    LANG: 'pref_lang',
    DATE: 'pref_datefmt',
    TIME: 'pref_timefmt',
};

const LANGS = ['en', 'en-IN', 'hi', 'bn', 'pa', 'ta', 'te'];

export default function SettingsPage() {
    const { theme, setTheme, availableThemes } = useTheme();

    // Local UI prefs
    const [accent, setAccent] = useState('#4a90e2');
    const [density, setDensity] = useState('comfortable'); // 'comfortable' | 'compact'
    const [highContrast, setHighContrast] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [lang, setLang] = useState(LANGS[1]); // en-IN
    const [dateFmt, setDateFmt] = useState('DD/MM/YYYY');
    const [timeFmt, setTimeFmt] = useState('24h');

    // Load persisted prefs
    useEffect(() => {
        try {
            const a = localStorage.getItem(LS_KEYS.ACCENT);
            const d = localStorage.getItem(LS_KEYS.DENSITY);
            const c = localStorage.getItem(LS_KEYS.CONTRAST);
            const m = localStorage.getItem(LS_KEYS.MOTION);
            const s = localStorage.getItem(LS_KEYS.SIDEBAR);
            const l = localStorage.getItem(LS_KEYS.LANG);
            const df = localStorage.getItem(LS_KEYS.DATE);
            const tf = localStorage.getItem(LS_KEYS.TIME);

            if (a) setAccent(a);
            if (d) setDensity(d);
            if (c) setHighContrast(c === '1');
            if (m) setReducedMotion(m === '1');
            if (s) setSidebarCollapsed(s === '1');
            if (l) setLang(l);
            if (df) setDateFmt(df);
            if (tf) setTimeFmt(tf);
        } catch { }
    }, []);

    // Apply prefs to document
    const applyAccent = useCallback((val) => {
        document.documentElement.style.setProperty('--primary', val);
        document.documentElement.style.setProperty('--primary-light', val + '20');
    }, []);

    const applyDensity = useCallback((d) => {
        document.documentElement.setAttribute('data-density', d);
    }, []);

    const applyContrast = useCallback((hc) => {
        document.documentElement.setAttribute('data-contrast', hc ? 'high' : 'normal');
    }, []);

    const applyMotion = useCallback((rm) => {
        document.documentElement.setAttribute('data-motion', rm ? 'reduced' : 'normal');
    }, []);

    useEffect(() => { applyAccent(accent); }, [accent, applyAccent]);
    useEffect(() => { applyDensity(density); }, [density, applyDensity]);
    useEffect(() => { applyContrast(highContrast); }, [highContrast, applyContrast]);
    useEffect(() => { applyMotion(reducedMotion); }, [reducedMotion, applyMotion]);

    // Handlers (with persistence)
    const onThemeChange = (next) => setTheme(next);

    const onAccentChange = (val) => {
        setAccent(val);
        try { localStorage.setItem(LS_KEYS.ACCENT, val); } catch { }
    };

    const onDensityChange = (d) => {
        setDensity(d);
        try { localStorage.setItem(LS_KEYS.DENSITY, d); } catch { }
    };

    const onContrastToggle = (v) => {
        setHighContrast(v);
        try { localStorage.setItem(LS_KEYS.CONTRAST, v ? '1' : '0'); } catch { }
    };

    const onMotionToggle = (v) => {
        setReducedMotion(v);
        try { localStorage.setItem(LS_KEYS.MOTION, v ? '1' : '0'); } catch { }
    };

    const onSidebarToggle = (v) => {
        setSidebarCollapsed(v);
        try { localStorage.setItem(LS_KEYS.SIDEBAR, v ? '1' : '0'); } catch { }
    };

    const onLangChange = (v) => {
        setLang(v);
        try { localStorage.setItem(LS_KEYS.LANG, v); } catch { }
    };

    const onDateFmtChange = (v) => {
        setDateFmt(v);
        try { localStorage.setItem(LS_KEYS.DATE, v); } catch { }
    };

    const onTimeFmtChange = (v) => {
        setTimeFmt(v);
        try { localStorage.setItem(LS_KEYS.TIME, v); } catch { }
    };

    const resetAll = () => {
        try { Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k)); } catch { }
        setAccent('#4a90e2');
        setDensity('comfortable');
        setHighContrast(false);
        setReducedMotion(false);
        setSidebarCollapsed(false);
        setLang(LANGS[1]);
        setDateFmt('DD/MM/YYYY');
        setTimeFmt('24h');
        applyAccent('#4a90e2');
        applyDensity('comfortable');
        applyContrast(false);
        applyMotion(false);
    };

    // Tiny Switch component
    const Switch = ({ checked, onChange, label }) => (
        <label className={styles.switch}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span className={styles.slider} />
            <span className={styles.switchLabel}>{label}</span>
        </label>
    );

    // SafeDropdown — adapts to many dropdown APIs (onSelect/onChange/onValueChange, items/options, etc.)
    const SafeDropdown = ({ value, options, onChange, className, nativeClassName }) => {
        // normalize to {label, value}
        const list = options.map((t) =>
            typeof t === 'string'
                ? { label: t.charAt(0).toUpperCase() + t.slice(1), value: t }
                : t
        );

        const labelByValue = new Map(list.map((o) => [o.value, o.label]));
        const valueByLabel = new Map(list.map((o) => [o.label, o.value]));

        const hasCustom = !!CustomDropdown && typeof CustomDropdown === 'function';

        // single handler that converts any payload to the theme "value"
        const handleAnyChange = (next) => {
            // accept: label string, option object, native event
            const label =
                (next && typeof next === 'object' && 'label' in next && next.label) ||
                (typeof next === 'string' ? next : '') ||
                (next && next.target && next.target.value);

            // if the component gives back value directly, map will fail; fallback to label==value scenario
            const derived =
                valueByLabel.get(label) ??
                (next && typeof next === 'object' && 'value' in next ? next.value : null) ??
                (typeof next === 'string' ? next : null);

            if (derived != null) onChange(derived);
        };

        if (hasCustom) {
            const labels = list.map((o) => o.label);
            const selectedLabel = labelByValue.get(value) || '';

            return (
                <CustomDropdown
                    /* common class & data */
                    className={className}

                    /* data props (covering different libs) */
                    options={labels}
                    items={labels}
                    data={labels}

                    /* value/selected props (covering different libs) */
                    value={selectedLabel}
                    selected={selectedLabel}
                    selectedItem={selectedLabel}

                    /* callbacks under multiple names */
                    onChange={handleAnyChange}
                    onSelect={handleAnyChange}
                    onValueChange={handleAnyChange}
                    setSelected={handleAnyChange}
                />
            );
        }

        // fallback: native select
        return (
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={nativeClassName || className}
            >
                {list.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        );
    };

    // Theme picker (works with CustomDropdown OR native select)
    const ThemePicker = (
        <div className={styles.fieldRow}>
            <label htmlFor="themeSelect">Theme</label>
            <SafeDropdown
                value={theme}
                options={availableThemes}           // can be ["light","dark",...] or [{label,value},...]
                onChange={onThemeChange}            // expects a string (the theme key)
                className={styles.dropdown}
                nativeClassName={styles.select}
            />
        </div>
    );


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Settings</h1>
                    <p>Personalize appearance, layout, and regional preferences.</p>
                </div>
                <button className={styles.resetBtn} onClick={resetAll} aria-label="Reset all preferences">
                    Reset to defaults
                </button>
            </header>

            <section className={styles.grid}>
                {/* Appearance */}
                <div className={styles.card}>
                    <h3>Appearance</h3>
                    <div className={styles.cardBody}>
                        {ThemePicker}

                        <div className={styles.fieldRow}>
                            <label htmlFor="accent">Accent</label>
                            <input
                                id="accent"
                                type="color"
                                value={accent}
                                onChange={(e) => onAccentChange(e.target.value)}
                                className={styles.color}
                                aria-label="Pick accent color"
                            />
                            <input
                                value={accent}
                                onChange={(e) => onAccentChange(e.target.value)}
                                className={styles.hexInput}
                                aria-label="Accent hex"
                            />
                        </div>

                        <div className={styles.fieldRow}>
                            <label>Density</label>
                            <div className={styles.segment}>
                                <button
                                    className={`${styles.segmentBtn} ${density === 'comfortable' ? styles.segmentActive : ''}`}
                                    onClick={() => onDensityChange('comfortable')}
                                >
                                    Comfortable
                                </button>
                                <button
                                    className={`${styles.segmentBtn} ${density === 'compact' ? styles.segmentActive : ''}`}
                                    onClick={() => onDensityChange('compact')}
                                >
                                    Compact
                                </button>
                            </div>
                        </div>

                        <div className={styles.switchGroup}>
                            <Switch checked={highContrast} onChange={onContrastToggle} label="High contrast" />
                            <Switch checked={reducedMotion} onChange={onMotionToggle} label="Reduce motion" />
                            <Switch checked={sidebarCollapsed} onChange={onSidebarToggle} label="Start with sidebar collapsed" />
                        </div>
                    </div>
                </div>

                {/* Region & Formats */}
                {/* <div className={styles.card}>
          <h3>Region & Formats</h3>
          <div className={styles.cardBody}>
            <div className={styles.fieldRow}>
              <label htmlFor="langSelect">Language</label>
              <select
                id="langSelect"
                value={lang}
                onChange={(e) => onLangChange(e.target.value)}
                className={styles.select}
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldRow}>
              <label>Date format</label>
              <div className={styles.segment}>
                {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map((f) => (
                  <button
                    key={f}
                    className={`${styles.segmentBtn} ${dateFmt === f ? styles.segmentActive : ''}`}
                    onClick={() => onDateFmtChange(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldRow}>
              <label>Time format</label>
              <div className={styles.segment}>
                {['12h','24h'].map((f) => (
                  <button
                    key={f}
                    className={`${styles.segmentBtn} ${timeFmt === f ? styles.segmentActive : ''}`}
                    onClick={() => onTimeFmtChange(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div> */}

                {/* Live Preview */}
                {/* <div className={`${styles.card} ${styles.previewCard}`}>
          <h3>Live Preview</h3>
          <div className={styles.previewBody}>
            <div className={styles.previewHeader}>
              <span className={styles.pill}>Badge</span>
              <button className={styles.primaryBtn}>Primary</button>
              <button className={styles.ghostBtn}>Ghost</button>
            </div>
            <div className={styles.previewForm}>
              <div className={styles.formRow}>
                <label>Input</label>
                <input placeholder="Type something…" />
              </div>
              <div className={styles.formRow}>
                <label>Select</label>
                <select>
                  <option>Option A</option>
                  <option>Option B</option>
                  <option>Option C</option>
                </select>
              </div>
            </div>
            <div className={styles.previewFooter}>
              <span className={styles.hint}>This is how UI elements adapt to your settings.</span>
            </div>
          </div>
        </div> */}

                {/* Data & Privacy */}
                {/* <div className={styles.card}>
          <h3>Data & Privacy</h3>
          <div className={styles.cardBody}>
            <p className={styles.description}>
              Download a copy of your app preferences or clear local-only data.
            </p>
            <div className={styles.actionsRow}>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  const payload = {
                    theme,
                    accent,
                    density,
                    highContrast,
                    reducedMotion,
                    sidebarCollapsed,
                    lang,
                    dateFmt,
                    timeFmt,
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `preferences-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export preferences
              </button>
              <button className={styles.dangerBtn} onClick={resetAll}>Clear local data</button>
            </div>
          </div>
        </div> */}

                {/* About */}
                <div className={styles.card}>
                    <h3>About</h3>
                    <div className={styles.cardBody}>
                        <ul className={styles.kv}>
                            <li><span>App</span><strong>H.R. Exports Console</strong></li>
                            <li><span>Version</span><strong>v1.0.0</strong></li>
                            <li><span>Theme</span><strong>{theme}</strong></li>
                            <li><span>Density</span><strong>{density}</strong></li>
                            <li><span>Locale</span><strong>{lang}</strong></li>
                        </ul>
                    </div>
                </div>

            </section>
        </div>
    );
}
