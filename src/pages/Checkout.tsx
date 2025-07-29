import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CreditCard, MapPin, Package } from "lucide-react";
import { AppDispatch, RootState } from "../store/store";
import { fetchCart } from "../store/slices/cartSlice";
import { createOrder } from "../store/slices/ordersSlice";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

interface CheckoutForm {
  shipping_address: string;
  payment_method: string;
}

const Checkout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useSelector(
    (state: RootState) => state.cart
  );
  const { loading: orderLoading } = useSelector(
    (state: RootState) => state.orders
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutForm>();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (user?.address) {
      setValue("shipping_address", user.address);
    }
  }, [user, setValue]);

  const onSubmit = async (data: CheckoutForm) => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const { id, ...rest } = await dispatch(createOrder(data)).unwrap();
      navigate(`/order-confirmation/${id}`);
      console.log(rest);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  const steps = [
    { id: 1, name: "Shipping", icon: MapPin },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: Package },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-2 text-sm ${
                    isActive ? "text-blue-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Shipping Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    {...register("shipping_address", {
                      required: "Shipping address is required",
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your complete shipping address..."
                  />
                  {errors.shipping_address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.shipping_address.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Information */}
            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        {...register("payment_method", {
                          required: "Please select a payment method",
                        })}
                        type="radio"
                        value="stripe"
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>Credit/Debit Card (Stripe)</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        {...register("payment_method")}
                        type="radio"
                        value="mock"
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>Mock Payment (Demo)</span>
                    </label>
                  </div>
                </div>

                {errors.payment_method && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.payment_method.message}
                  </p>
                )}

                <div className="flex space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Order Review */}
            {currentStep === 3 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Review Your Order
                </h2>

                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × $
                          {parseFloat(item.product.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${parseFloat(item.total_price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {orderLoading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${parseFloat(cart.total_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>$0.00</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${parseFloat(cart.total_price).toFixed(2)}</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">
                {cart.total_items} item{cart.total_items !== 1 ? "s" : ""} in
                your cart
              </p>
              <p>Free shipping on all orders!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
