'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '@/hooks/use-api';
import { PaymentStatusFilter } from '../../../components/admin/PaymentStatusFilter';
import { UserSearch } from '../../../components/admin/UserSearch';
import { UsersTable } from '../../../components/admin/UsersTable';
import { StatusUpdateModal } from '../../../components/admin/StatusUpdateModal';
import { ImagePreviewModal } from '../../../components/admin/ImagePreviewModal';
import { User, PaymentFilter, SortConfig } from '../../../config/admin/types';

export default function Users() {
  const { makeRequest } = useApi();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [selectedTransaction, setSelectedTransaction] = useState<{
    transactionId: string;
    userId: string;
    currentStatus: 'pending' | 'verified' | 'rejected';
    targetStatus: 'pending' | 'verified' | 'rejected';
  } | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);

    const response = await makeRequest<{
      data: {
        users: User[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
      status: string;
    }>('GET', `/admin/users`, undefined, 'Failed to fetch users', false);

    if (response.status === 'success') {
      const newUsers = response.data?.data?.users || [];

      setAllUsers(prevUsers => {
        const userMap = new Map();
        [...prevUsers, ...newUsers].forEach(user => userMap.set(user.id, user));
        return Array.from(userMap.values());
      });

      setInitialLoadDone(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const updateUserTransactionStatus = (
    userId: string,
    transactionId: string,
    newStatus: 'pending' | 'verified' | 'rejected',
    notes: string
  ) => {
    setAllUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === userId && user.transactions && user.transactions.length > 0) {
          const updatedTransactions = user.transactions.map(transaction => {
            if (transaction.id === transactionId) {
              return {
                ...transaction,
                status: newStatus,
                notes: notes,
              };
            }
            return transaction;
          });

          return {
            ...user,
            transactions: updatedTransactions,
          };
        }
        return user;
      });
    });
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...allUsers];

    if (paymentFilter !== 'all') {
      result = result.filter(user => {
        const status = user.transactions?.[0]?.status || 'none';
        return (
          (paymentFilter === 'paid' && (status === 'verified' || status === 'pending')) ||
          (paymentFilter === 'unpaid' && status === 'rejected')
        );
      });
    }

    if (search.trim()) {
      const lowerSearch = search.toLowerCase().trim();
      result = result.filter(
        user =>
          user.name?.toLowerCase().includes(lowerSearch) ||
          user.email?.toLowerCase().includes(lowerSearch) ||
          user.phone?.toLowerCase().includes(lowerSearch)
      );
    }

    result.sort((a, b) => {
      // Special handling for referralsCount
      if (sortConfig.key === 'referralsCount') {
        const aCount = a.referrals?.length || 0;
        const bCount = b.referrals?.length || 0;

        if (aCount < bCount) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aCount > bCount) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }

      // Regular sorting for other fields
      const aValue = a[sortConfig.key as keyof User];
      const bValue = b[sortConfig.key as keyof User];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [allUsers, paymentFilter, search, sortConfig]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleUpdateTransactionStatus = async () => {
    if (!selectedTransaction) return;

    const originalUsers = [...allUsers];

    updateUserTransactionStatus(
      selectedTransaction.userId,
      selectedTransaction.transactionId,
      selectedTransaction.targetStatus,
      statusNotes
    );

    setIsStatusModalOpen(false);
    setStatusNotes('');

    const response = await makeRequest(
      'POST',
      '/admin/transactions/update',
      {
        transactionId: selectedTransaction.transactionId,
        status: selectedTransaction.targetStatus,
        notes: statusNotes,
      },
      `Failed to update transaction status to ${selectedTransaction.targetStatus}`
    );

    if (response.status !== 'success') {
      setAllUsers(originalUsers);
    }

    setSelectedTransaction(null);
  };

  const openStatusModal = (
    transactionId: string,
    userId: string,
    currentStatus: 'pending' | 'verified' | 'rejected',
    targetStatus: 'pending' | 'verified' | 'rejected'
  ) => {
    setSelectedTransaction({
      transactionId,
      userId,
      currentStatus,
      targetStatus,
    });
    setStatusNotes('');
    setIsStatusModalOpen(true);
  };

  const openImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <UserSearch search={search} setSearch={setSearch} />
          <PaymentStatusFilter paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter} />
        </div>
      </div>

      <UsersTable
        users={filteredAndSortedUsers}
        isLoading={isLoading}
        sortConfig={sortConfig}
        handleSort={handleSort}
        openImagePreview={openImagePreview}
        openStatusModal={openStatusModal}
      />

      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        selectedTransaction={selectedTransaction}
        statusNotes={statusNotes}
        setStatusNotes={setStatusNotes}
        onConfirm={handleUpdateTransactionStatus}
      />

      <ImagePreviewModal imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
    </div>
  );
}
