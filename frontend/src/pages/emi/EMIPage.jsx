import React, { useState, useEffect } from 'react';
import { emiApi } from '../../services/api';
import { FaCalendarAlt, FaRupeeSign, FaInfoCircle } from 'react-icons/fa';

const EMIPage = () => {
  const [emiPlans, setEmiPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmiPlans();
  }, []);

  const fetchEmiPlans = async () => {
    try {
      setLoading(true);
      const response = await emiApi.getUserEmiPlans();
      if (response.data.success) {
        setEmiPlans(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching EMI plans:', error);
      setError('Failed to load EMI plans. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My EMI Plans</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : emiPlans.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No EMI Plans</h3>
          <p className="text-gray-500 mb-6">You don't have any active EMI plans at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {emiPlans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {plan.product?.name || 'Product'}
                    </h3>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                        {plan.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-800">
                      {formatCurrency(plan.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {plan.tenure} months
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>EMI Amount:</span>
                    <span className="font-medium">{formatCurrency(plan.emiAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Interest Rate:</span>
                    <span className="font-medium">{plan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Start Date:</span>
                    <span className="font-medium">{formatDate(plan.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>End Date:</span>
                    <span className="font-medium">{formatDate(plan.endDate)}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Payment Schedule</h4>
                  <div className="space-y-3">
                    {plan.installments?.map((installment, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-md bg-gray-50">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            installment.status === 'paid' 
                              ? 'bg-green-100 text-green-600' 
                              : installment.status === 'overdue'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            <FaRupeeSign />
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">
                              Installment {index + 1}
                            </div>
                            <div className="text-xs text-gray-500">
                              Due: {formatDate(installment.dueDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-4 text-right">
                            <div className="font-medium text-gray-700">
                              {formatCurrency(installment.amount)}
                            </div>
                            <div className={`text-xs ${
                              installment.status === 'paid' 
                                ? 'text-green-600' 
                                : installment.status === 'overdue'
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                            }`}>
                              {installment.status.charAt(0).toUpperCase() + installment.status.slice(1)}
                            </div>
                          </div>
                          {installment.status !== 'paid' && (
                            <button className="px-3 py-1 bg-main text-white text-sm rounded hover:bg-main-dark transition-colors">
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {plan.status !== 'completed' && (
                  <div className="mt-6 flex items-center p-3 bg-blue-50 text-blue-700 rounded-md">
                    <FaInfoCircle className="mr-2" />
                    <span className="text-sm">
                      Next payment of {formatCurrency(plan.emiAmount)} due on {formatDate(plan.nextDueDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EMIPage;