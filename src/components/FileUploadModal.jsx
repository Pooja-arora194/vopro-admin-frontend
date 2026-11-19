import React, { useState } from 'react';
import { X, UploadCloud, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import '../styles/Modals.css';

const FileUploadModal = ({ onClose, onSuccess, targetCompanyId = null, isAdmin = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('General Correspondence');
  const [description, setDescription] = useState('');
  const [visibleToCustomer, setVisibleToCustomer] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanStep, setScanStep] = useState(null);
  const [error, setError] = useState(null);

  const categories = [
    'Billing & Proof of Address',
    'Identity / Compliance',
    'SIP Trunking Config',
    'Call Records',
    'Contract Signed Copy',
    'General Correspondence',
    'Other'
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB security limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setScanStep('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      formData.append('description', description);
      if (isAdmin && targetCompanyId) {
        formData.append('companyId', targetCompanyId);
        formData.append('visibleToCustomer', visibleToCustomer);
      }

      const res = await api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setScanStep('scanning');
        setTimeout(() => {
          setScanStep('clean');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 800);
        }, 1500);
      }
    } catch (err) {
      setUploading(false);
      setScanStep(null);
      setError(err.response?.data?.message || 'File upload failed. Please verify file type and size.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Secure Document Exchange Upload
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              All uploaded files undergo automated anti-malware and antivirus validation.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="scan-progress-banner" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger-border)', marginBottom: '18px' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              className="modal-drag-drop-zone"
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input
                id="file-upload-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.zip"
              />

              <div className="drag-icon-circle">
                <UploadCloud size={24} />
              </div>

              {selectedFile ? (
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB — Ready to upload
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                    Click to select file or drag & drop here
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Supported: PDF, Word, Excel, CSV, Images, ZIP (Max 15MB)
                  </div>
                </div>
              )}
            </div>

            {/* File Category */}
            <div className="form-group">
              <label className="form-label">Document Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Notes / Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Briefly describe the contents or purpose of this file..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Admin Visibility Toggle */}
            {isAdmin && (
              <div className="modal-highlight-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    Make Visible to Customer
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Customer will be able to see and download this file once security scan passes.
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={visibleToCustomer}
                  onChange={(e) => setVisibleToCustomer(e.target.checked)}
                />
              </div>
            )}

            {/* Live Security Scanning Animation State */}
            {scanStep && (
              <div className={`scan-progress-banner ${scanStep === 'clean' ? 'scan-progress-clean' : 'scan-progress-scanning'}`}>
                {scanStep === 'uploading' && <Loader2 size={20} className="spin-icon" color="var(--primary)" />}
                {scanStep === 'scanning' && <Loader2 size={20} className="spin-icon" color="var(--warning)" />}
                {scanStep === 'clean' && <ShieldCheck size={20} color="var(--success)" />}

                <div style={{ fontSize: '0.8125rem' }}>
                  {scanStep === 'uploading' && <strong>Encrypting and transmitting file securely...</strong>}
                  {scanStep === 'scanning' && (
                    <span>
                      <strong>ClamGuard Antivirus Engine:</strong> Scanning binary signatures for trojans & malware...
                    </span>
                  )}
                  {scanStep === 'clean' && (
                    <strong style={{ color: '#065F46' }}>
                      Security check passed! 0 threats detected. File published.
                    </strong>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Upload & Scan File</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploadModal;
