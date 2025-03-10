'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/Admin.module.css';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';

interface User {
  _id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className={styles.usersContainer}>
      <h1 className={styles.pageTitle}>유저 관리</h1>
      
      <div className={styles.searchBar}>
        <Input
          type="text"
          placeholder="유저의 닉네임 또는 이메일로 검색해보세요"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div className={styles.tableCard}>
        <h2 className={styles.cardTitle}>전체 유저</h2>
        
        {loading && <div className={styles.loading}>유저 로딩중...</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        {filteredUsers.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <th>닉네임</th>
                <th>이메일</th>
                <th>이메일 인증여부</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.isEmailVerified ? styles.unverifiedBadge : styles.verifiedBadge}>
                      {user.isEmailVerified ? '인증됨' : '인증됨'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className={styles.emptyState}>
            {searchTerm ? 'No users matching your search term' : 'No users found'}
          </div>
        )}
      </div>
    </div>
  );
}
