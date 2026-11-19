import React, { useState, useEffect, useRef } from 'react';
import { Country, State, City } from 'country-state-city';
import { ChevronDown, Search, X } from 'lucide-react';

/*
  Props:
    country, state, city          — current values (name strings)
    onCountryChange(name, isoCode)
    onStateChange(name, isoCode)
    onCityChange(name)
*/

const Dropdown = ({ label, value, options, onChange, placeholder, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="loc-dropdown" ref={ref}>
      <label className="form-label">{label}</label>
      <button
        type="button"
        className={`loc-trigger ${disabled ? 'loc-trigger-disabled' : ''}`}
        onClick={() => { if (!disabled) { setOpen(o => !o); setSearch(''); } }}
      >
        <span className={value ? 'loc-trigger-value' : 'loc-trigger-placeholder'}>
          {value || placeholder}
        </span>
        <div className="loc-trigger-icons">
          {value && !disabled && (
            <X size={12} className="loc-clear"
              onClick={e => { e.stopPropagation(); onChange(null); setOpen(false); }} />
          )}
          <ChevronDown size={14} className={`loc-chevron ${open ? 'loc-chevron-open' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="loc-menu">
          <div className="loc-search-box">
            <Search size={13} className="loc-search-icon" />
            <input
              autoFocus
              type="text"
              className="loc-search-input"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="loc-options">
            {filtered.length === 0 ? (
              <div className="loc-no-results">No results found</div>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  className={`loc-option ${value === o.label ? 'loc-option-active' : ''}`}
                  onClick={() => { onChange(o); setOpen(false); setSearch(''); }}
                >
                  {o.flag && <span className="loc-flag">{o.flag}</span>}
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LocationSelector = ({ country, state, city, onCountryChange, onStateChange, onCityChange }) => {
  const [countryIso, setCountryIso] = useState('');
  const [stateIso, setStateIso] = useState('');

  // Build options
  const countryOptions = Country.getAllCountries().map(c => ({
    label: c.name, value: c.isoCode, flag: c.flag
  }));

  const stateOptions = countryIso
    ? State.getStatesOfCountry(countryIso).map(s => ({ label: s.name, value: s.isoCode }))
    : [];

  const cityOptions = countryIso && stateIso
    ? City.getCitiesOfState(countryIso, stateIso).map(c => ({ label: c.name, value: c.name }))
    : [];

  // Sync isoCode when parent sets initial value
  useEffect(() => {
    if (country) {
      const found = Country.getAllCountries().find(c => c.name === country);
      if (found) setCountryIso(found.isoCode);
    }
  }, [country]);

  useEffect(() => {
    if (state && countryIso) {
      const found = State.getStatesOfCountry(countryIso).find(s => s.name === state);
      if (found) setStateIso(found.isoCode);
    }
  }, [state, countryIso]);

  const handleCountry = (opt) => {
    if (!opt) {
      setCountryIso(''); setStateIso('');
      onCountryChange('', '');
      onStateChange('', '');
      onCityChange('');
    } else {
      setCountryIso(opt.value); setStateIso('');
      onCountryChange(opt.label, opt.value);
      onStateChange('', '');
      onCityChange('');
    }
  };

  const handleState = (opt) => {
    if (!opt) {
      setStateIso('');
      onStateChange('', '');
      onCityChange('');
    } else {
      setStateIso(opt.value);
      onStateChange(opt.label, opt.value);
      onCityChange('');
    }
  };

  const handleCity = (opt) => {
    onCityChange(opt ? opt.label : '');
  };

  return (
    <div className="loc-wrapper">
      <Dropdown
        label="Country"
        value={country}
        options={countryOptions}
        onChange={handleCountry}
        placeholder="Select country..."
      />
      <Dropdown
        label="State / County"
        value={state}
        options={stateOptions}
        onChange={handleState}
        placeholder="Select state..."
        disabled={!countryIso}
      />
      <div className="loc-dropdown">
        <label className="form-label">City</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. London"
          value={city || ''}
          onChange={e => onCityChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default LocationSelector;
