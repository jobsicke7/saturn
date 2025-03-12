'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';

interface Admin {
  _id: string;
  email: string;
  createdAt: string;
}

export default function PermissionsList() {
  const [email, setEmail] = useState('');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/permissions');
      const data = await response.json();
      
      if (data.success) {
        setAdmins(data.admins);
      } else {
        setError(data.message || 'Failed to fetch admins');
      }
    } catch (err) {
      setError('An error occurred while fetching admins');
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('올바른 형식의 메일주소를 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('성공적으로 등록되었습니다.');
        setEmail('');
        fetchAdmins();
      } else {
        setError(data.message || '관리자 등록에 실패했습니다.');
      }
    } catch (err) {
      setError('관리자 등록중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async (id: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/permissions?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('성공적으로 제거가 완료되었습니다.');
        fetchAdmins();
      } else {
        setError(data.message || '관리자 제거에 실패했습니다.');
      }
    } catch (err) {
      setError('관리자 제거중 에러가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.permissionsContainer}>
      <h1 className={styles.pageTitle}>관리자 권한</h1>
      
      <div className={styles.formCard}>
        <h2 className={styles.cardTitle}>관리자 등록</h2>
        
        <form onSubmit={addAdmin} className={styles.form}>
          <div className={styles.formGroup}>
            <Input
              type="email"
              placeholder="관리자로 등록할 이메일주소를 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? '추가중...' : '관리자 등록'}
          </Button>
        </form>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
      </div>
      
      <div className={styles.tableCard}>
        <h2 className={styles.cardTitle}>관리자 계정</h2>
        
        {loading && <div className={styles.loading}>로딩중...</div>}
        
        {admins.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>이메일</th>
                <th>관리자 등록일</th>
                <th>조치</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.email}</td>
                  <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td>
                    {admin.email !== 'jobsicke282@gmail.com' && (
                      <Button 
                        onClick={() => removeAdmin(admin._id)}
                        variant="danger"
                        disabled={loading}
                      >
                        제거
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className={styles.emptyState}>관리자로 등록된 유저가 없어요.</div>
        )}
      </div>
    </div>
  );
}
