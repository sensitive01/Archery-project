import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, prev, next }) => {    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
                Page <span style={{ color: '#0F172A', fontWeight: '700' }}>{currentPage}</span> of <span style={{ color: '#0F172A', fontWeight: '700' }}>{totalPages}</span>
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={prev} 
                    disabled={currentPage === 1}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', 
                        backgroundColor: currentPage === 1 ? '#F1F5F9' : 'white', 
                        color: currentPage === 1 ? '#94A3B8' : '#1E40AF', 
                        border: '1px solid #E2E8F0', borderRadius: '6px', 
                        fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <ChevronLeft size={16} /> Prev
                </button>
                <button 
                    onClick={next} 
                    disabled={currentPage === totalPages}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', 
                        backgroundColor: currentPage === totalPages ? '#F1F5F9' : 'white', 
                        color: currentPage === totalPages ? '#94A3B8' : '#1E40AF', 
                        border: '1px solid #E2E8F0', borderRadius: '6px', 
                        fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
