import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const orderId = Math.floor(1000 + Math.random() * 9000);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-1">Thank you for shopping with Brand Essence</p>
        <p className="text-sm text-muted-foreground mb-6">Order ID: <span className="font-semibold text-foreground">#{orderId}</span></p>
        <div className="flex gap-3 justify-center">
          <Link to="/profile" className="btn-gold text-sm">View My Orders</Link>
          <Link to="/shop" className="btn-outline-gold text-sm">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
