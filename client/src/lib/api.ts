// API client functions for the Evia Order Tracking Platform

export interface OrderLookupResponse {
  order: {
    id: string;
    orderNumber: string;
    externalOrderId: string;
    customerId: string;
    totalAmount: number;
    status: string;
    progressPercent: number;
    createdAt: string;
    updatedAt: string;
  };
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
  stages: Array<{
    id: string;
    orderId: string;
    stageType: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    notes?: string;
  }>;
  media: Array<{
    id: string;
    orderId: string;
    stageId?: string;
    url: string;
    type: string;
    createdAt: string;
  }>;
  appointment?: {
    id: string;
    orderId: string;
    scheduledAt: string;
    locationAddress: string;
    notes?: string;
  };
  rating?: {
    id: string;
    orderId: string;
    rating: number;
    comment?: string;
    createdAt: string;
  };
}

export interface AdminLoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Public endpoints
export async function lookupOrder(phone: string, orderNumber: string): Promise<OrderLookupResponse> {
  const response = await fetch("/api/public/order-lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, orderNumber })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to lookup order");
  }
  
  return response.json();
}

export async function submitRating(orderId: string, rating: number, comment: string) {
  const response = await fetch(`/api/public/orders/${orderId}/rating`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, comment })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit rating");
  }
  
  return response.json();
}

// Admin endpoints
export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to login");
  }
  
  return response.json();
}

export async function getOrders(token: string, filters?: {
  status?: string;
  stageType?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all") params.append("status", filters.status);
  if (filters?.stageType && filters.stageType !== "all") params.append("stageType", filters.stageType);
  if (filters?.fromDate) params.append("fromDate", filters.fromDate);
  if (filters?.toDate) params.append("toDate", filters.toDate);

  const response = await fetch(`/api/admin/orders?${params}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  
  return response.json();
}

export async function getOrderDetails(token: string, orderId: string) {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch order details");
  }
  
  return response.json();
}

export async function updateOrderStatus(token: string, orderId: string, status: string, progressPercent?: number) {
  const response = await fetch(`/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status, progressPercent })
  });
  
  if (!response.ok) {
    throw new Error("Failed to update order status");
  }
  
  return response.json();
}

export async function updateStage(token: string, orderId: string, stageId: string, status: string, notes?: string) {
  const response = await fetch(`/api/admin/orders/${orderId}/stages/${stageId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status, notes })
  });
  
  if (!response.ok) {
    throw new Error("Failed to update stage");
  }
  
  return response.json();
}

export async function createAppointment(token: string, orderId: string, data: {
  scheduledAt: string;
  locationAddress: string;
  notes?: string;
}) {
  const response = await fetch(`/api/admin/orders/${orderId}/appointment`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error("Failed to save appointment");
  }
  
  return response.json();
}

export async function addMedia(token: string, orderId: string, data: {
  url: string;
  type: "IMAGE" | "DOCUMENT";
  stageId: string;
}) {
  const response = await fetch(`/api/admin/orders/${orderId}/media`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add media");
  }
  
  return response.json();
}

export async function createOrder(token: string, data: {
  customerName: string;
  phone: string;
  email?: string;
  totalAmount: number;
  externalOrderId?: string;
}) {
  const response = await fetch("/api/admin/orders", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create order");
  }
  
  return response.json();
}

export async function createStage(token: string, orderId: string, data: {
  stageType: string;
  status?: string;
  notes?: string;
}) {
  const response = await fetch(`/api/admin/orders/${orderId}/stages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create stage");
  }
  
  return response.json();
}

export async function deleteStage(token: string, orderId: string, stageId: string) {
  const response = await fetch(`/api/admin/orders/${orderId}/stages/${stageId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete stage");
  }
  
  return response.json();
}

export async function sendEmailUpdate(token: string, orderId: string, data: {
  subject: string;
  message: string;
}) {
  const response = await fetch(`/api/admin/orders/${orderId}/email`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send email");
  }
  
  return response.json();
}

export async function cancelOrder(token: string, orderId: string, reason?: string) {
  const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel order");
  }
  
  return response.json();
}
