import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import BookingFormModal from '../components/BookingFormModal';

const RESOURCE_IMAGES = {
  'Computer Lab': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
  'Classroom': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
  'Seminar Hall': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80',
  'Auditorium': 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&q=80',
  'Library Study Room': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
  'Conference Room': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  'Projector': 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80',
  'Smart Board': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80',
  'Physics Laboratory': 'https://images.unsplash.com/photo-1532094349884-543559a8e958?w=400&q=80',
  'Electronics Laboratory': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
  'Sports Ground': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80',
  'Basketball Court': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
  'Meeting Room': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  'Innovation Lab': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&q=80',
};

const TYPES = ['All', 'Computer Lab', 'Classroom', 'Seminar Hall', 'Auditorium',
  'Library Study Room', 'Conference Room', 'Projector', 'Smart Board',
  'Physics Laboratory', 'Electronics Laboratory', 'Sports Ground',
  'Basketball Court', 'Meeting Room', 'Innovation Lab'];

const QUICK_FILTERS = [
  { label: '🏋️ Sports', value: 'Sports Ground' },
  { label: '💻 Computer Lab', value: 'Computer Lab' },
  { label: '🏫 Classroom', value: 'Classroom' },
  { label: '🎤 Auditorium', value: 'Auditorium' },
  { label: '📚 Library', value: 'Library Study Room' },
  { label: '🔬 Lab', value: 'Physics Laboratory' },
  { label: '🏀 Basketball', value: 'Basketball Court' },
  { label: '💡 Innovation', value: 'Innovation Lab' },
];

const isAvail = (a) => a === true || a === 'true' || a === 'available';

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [bookingResource, setBookingResource] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    api.get('/resources').then(res => {
      const data = res.data.resources || res.data.data || res.data;
      setAllResources(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== 'All') params.type = typeFilter;
      if (availFilter !== 'all') params.availability = availFilter === 'available';
      const res = await api.get('/resources', { params });
      const data = res.data.resources || res.data.data || res.data;
      let arr = Array.isArray(data) ? data : [];
      if (sortBy === 'name_asc') arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
      else if (sortBy === 'name_desc') arr = [...arr].sort((a, b) => b.name.localeCompare(a.name));
      else if (sortBy === 'capacity_asc') arr = [...arr].sort((a, b) => a.capacity - b.capacity);
      else if (sortBy === 'capacity_desc') arr = [...arr].sort((a, b) => b.capacity - a.capacity);
      else if (sortBy === 'available_first') arr = [...arr].sort((a, b) => isAvail(b.availability) - isAvail(a.availability));
      setResources(arr);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchResources(); }, [search, typeFilter, availFilter, sortBy]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (val.trim().length > 0) {
      const q = val.toLowerCase();
      const matched = allResources.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.type?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.facilities?.some(f => f.toLowerCase().includes(q))
      ).slice(0, 7);
      setSuggestions(matched);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(val); }, 350);
  };

  const handleSuggestionClick = (r) => {
    setInputVal(r.name); setSearch(r.name);
    setSuggestions([]); setShowSuggestions(false);
  };

  const handleClear = () => {
    setInputVal(''); setSearch('');
    setSuggestions([]); setShowSuggestions(false);
  };

  const clearAll = () => {
    handleClear(); setTypeFilter('All');
    setAvailFilter('all'); setSortBy('default');
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getImage = (r) => r.image || RESOURCE_IMAGES[r.type] || RESOURCE_IMAGES.default;
  const hasFilters = search || typeFilter !== 'All' || availFilter !== 'all' || sortBy !== 'default';

  const getSimilar = () => {
    if (!search) return [];
    const q = search.toLowerCase()[0];
    return allResources.filter(r => r.name?.toLowerCase().includes(q)).slice(0, 4);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="container">
          <h1>Campus Resources</h1>
          <p>Find and book the perfect space or equipment for your needs</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>

        {/* Quick Filter Chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {QUICK_FILTERS.map(qf => (
            <button key={qf.value}
              onClick={() => setTypeFilter(typeFilter === qf.value ? 'All' : qf.value)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                border: `2px solid ${typeFilter === qf.value ? 'var(--primary)' : 'var(--border)'}`,
                background: typeFilter === qf.value ? 'var(--primary)' : 'var(--bg)',
                color: typeFilter === qf.value ? '#fff' : 'var(--text)',
                fontWeight: typeFilter === qf.value ? 700 : 400, transition: 'all 0.2s',
              }}>
              {qf.label}
            </button>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="filters-bar" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div className="search-box" ref={searchRef} style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search by name, type, location, facility..."
              value={inputVal} onChange={handleInputChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="search-input" autoComplete="off" />
            {inputVal && <button className="search-clear" onClick={handleClear}>✕</button>}

            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '0 0 12px 12px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                zIndex: 1000, overflow: 'hidden',
              }}>
                <div style={{ padding: '6px 14px', fontSize: 11, color: 'var(--text-light)', background: 'var(--bg2)', fontWeight: 600 }}>SUGGESTIONS</div>
                {suggestions.map((r) => (
                  <div key={r._id} onClick={() => handleSuggestionClick(r)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <img src={getImage(r)} alt={r.name}
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.src = RESOURCE_IMAGES.default; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>🏷️ {r.type} · 📍 {r.location}</div>
                    </div>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, flexShrink: 0,
                      background: isAvail(r.availability) ? '#d1fae5' : '#fee2e2',
                      color: isAvail(r.availability) ? '#065f46' : '#991b1b',
                    }}>
                      {isAvail(r.availability) ? '● Available' : '● Unavailable'}
                    </span>
                  </div>
                ))}
                <div style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-light)', textAlign: 'center', background: 'var(--bg2)' }}>
                  ↵ Press Enter or click to search
                </div>
              </div>
            )}
          </div>

          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={availFilter} onChange={e => setAvailFilter(e.target.value)}>
            <option value="all">All Availability</option>
            <option value="available">✅ Available Only</option>
            <option value="unavailable">❌ Unavailable</option>
          </select>
          <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="available_first">✅ Available First</option>
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
            <option value="capacity_desc">Capacity: High → Low</option>
            <option value="capacity_asc">Capacity: Low → High</option>
          </select>

          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <button onClick={() => setViewMode('grid')}
              style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', fontSize: 16, background: viewMode === 'grid' ? 'var(--primary)' : 'var(--bg)', color: viewMode === 'grid' ? '#fff' : 'var(--text)' }}>⊞</button>
            <button onClick={() => setViewMode('list')}
              style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', fontSize: 16, background: viewMode === 'list' ? 'var(--primary)' : 'var(--bg)', color: viewMode === 'list' ? '#fff' : 'var(--text)' }}>☰</button>
          </div>

          {hasFilters && <button className="btn btn-outline" onClick={clearAll}>Clear All</button>}
        </div>

        {/* Active chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, marginBottom: 4 }}>
            {search && <span style={{ padding: '4px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>🔍 "{search}" <button onClick={handleClear} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>✕</button></span>}
            {typeFilter !== 'All' && <span style={{ padding: '4px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>🏷️ {typeFilter} <button onClick={() => setTypeFilter('All')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>✕</button></span>}
            {availFilter !== 'all' && <span style={{ padding: '4px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>{availFilter === 'available' ? '✅' : '❌'} {availFilter} <button onClick={() => setAvailFilter('all')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>✕</button></span>}
            {sortBy !== 'default' && <span style={{ padding: '4px 12px', background: '#6366f1', color: '#fff', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>↕️ Sorted <button onClick={() => setSortBy('default')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>✕</button></span>}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><Loader /></div>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No resources found</h3>
            <p>Try different keywords or clear filters</p>
            <button className="btn btn-primary" onClick={clearAll} style={{ marginBottom: 24 }}>Clear All Filters</button>
            {getSimilar().length > 0 && (
              <div>
                <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 12 }}>You might be looking for:</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {getSimilar().map(r => (
                    <button key={r._id} onClick={() => { setInputVal(r.name); setSearch(r.name); }}
                      style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src={getImage(r)} style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} alt="" />
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-light)', margin: '16px 0 20px', fontSize: 14 }}>
              Showing <strong>{resources.length}</strong> resource{resources.length !== 1 ? 's' : ''}
              {search && <span> for "<strong>{search}</strong>"</span>}
            </p>

            {viewMode === 'grid' && (
              <div className="resources-grid">
                {resources.map(resource => (
                  <div key={resource._id} className="resource-card">
                    <div className="resource-card-image">
                      <img src={getImage(resource)} alt={resource.name} onError={e => { e.target.src = RESOURCE_IMAGES.default; }} />
                      <div className="resource-card-tag">{resource.type}</div>
                      <div className={`resource-card-badge ${isAvail(resource.availability) ? 'badge-available' : 'badge-unavailable'}`}>
                        {isAvail(resource.availability) ? '● Available' : '● Unavailable'}
                      </div>
                    </div>
                    <div className="resource-card-body">
                      <h3 className="resource-card-title">{resource.name}</h3>
                      <p className="resource-card-desc">{resource.description?.slice(0, 80)}...</p>
                      <div className="resource-card-meta">
                        <span>📍 {resource.location}</span>
                        <span>👥 {resource.capacity} people</span>
                      </div>
                      {resource.facilities?.length > 0 && (
                        <div className="resource-facilities">
                          {resource.facilities.slice(0, 3).map(f => <span key={f} className="facility-chip">{f}</span>)}
                          {resource.facilities.length > 3 && <span className="facility-chip">+{resource.facilities.length - 3}</span>}
                        </div>
                      )}
                      <div className="resource-card-actions">
                        <Link to={`/resources/${resource._id}`} className="btn btn-outline btn-sm">View Details</Link>
                        {isAvail(resource.availability) && user && <button className="btn btn-primary btn-sm" onClick={() => setBookingResource(resource)}>Book Now</button>}
                        {!user && isAvail(resource.availability) && <Link to="/login" className="btn btn-primary btn-sm">Login to Book</Link>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resources.map(resource => (
                  <div key={resource._id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <img src={getImage(resource)} alt={resource.name}
                      style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.src = RESOURCE_IMAGES.default; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{resource.name}</h3>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg2)', color: 'var(--text-light)', fontWeight: 600 }}>{resource.type}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: isAvail(resource.availability) ? '#d1fae5' : '#fee2e2', color: isAvail(resource.availability) ? '#065f46' : '#991b1b' }}>
                          {isAvail(resource.availability) ? '● Available' : '● Unavailable'}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-light)', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.description?.slice(0, 100)}</p>
                      <div style={{ fontSize: 12, color: 'var(--text-light)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span>📍 {resource.location}</span>
                        <span>👥 {resource.capacity} people</span>
                        {resource.facilities?.slice(0, 2).map(f => <span key={f}>✓ {f}</span>)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      <Link to={`/resources/${resource._id}`} className="btn btn-outline btn-sm">Details</Link>
                      {isAvail(resource.availability) && user && <button className="btn btn-primary btn-sm" onClick={() => setBookingResource(resource)}>Book Now</button>}
                      {!user && isAvail(resource.availability) && <Link to="/login" className="btn btn-primary btn-sm">Login</Link>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {bookingResource && (
        <BookingFormModal resource={bookingResource}
          onClose={() => setBookingResource(null)}
          onSuccess={() => { setBookingResource(null); }} />
      )}
    </div>
  );
};

export default Resources;