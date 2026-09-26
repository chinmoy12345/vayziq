"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type ReviewStatus = "Pending" | "Approved" | "Rejected";

interface Review {
  id: number;
  customer: string;
  email: string;
  mobile: string;
  product: string;
  productId: number;
  orderNo: string;
  rating: number;
  title: string;
  review: string;
  date: string;
  status: ReviewStatus;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: 1,
    customer: "Susmita Ghosh",
    email: "susmita@example.com",
    mobile: "9876543210",
    product: "Premium Cotton Saree",
    productId: 101,
    orderNo: "#ORD-00257",
    rating: 5,
    title: "Beautiful saree",
    review:
      "Very beautiful saree. Fabric quality is excellent and the colour is exactly as shown. The finishing is also very good. I am very happy with this purchase.",
    date: "11 Sep 2026",
    status: "Approved",
    verified: true,
  },
  {
    id: 2,
    customer: "Moumita Das",
    email: "moumita@example.com",
    mobile: "9830123456",
    product: "Printed Daily Wear Kurti",
    productId: 102,
    orderNo: "#ORD-00256",
    rating: 4,
    title: "Good quality",
    review:
      "The kurti is comfortable and looks very nice. Size was also perfect. Overall a good purchase.",
    date: "10 Sep 2026",
    status: "Pending",
    verified: true,
  },
  {
    id: 3,
    customer: "Riya Sen",
    email: "riya@example.com",
    mobile: "9123456780",
    product: "Floral Nightwear Set",
    productId: 103,
    orderNo: "#ORD-00255",
    rating: 5,
    title: "Very comfortable",
    review:
      "Loved the fabric. It is soft and comfortable for regular use. The print is also beautiful.",
    date: "09 Sep 2026",
    status: "Approved",
    verified: true,
  },
  {
    id: 4,
    customer: "Ananya Roy",
    email: "ananya@example.com",
    mobile: "9007123456",
    product: "Designer Silk Saree",
    productId: 104,
    orderNo: "#ORD-00254",
    rating: 3,
    title: "Average",
    review:
      "The saree looks good but the colour is slightly different from the pictures.",
    date: "08 Sep 2026",
    status: "Pending",
    verified: true,
  },
  {
    id: 5,
    customer: "Puja Chatterjee",
    email: "puja@example.com",
    mobile: "9887654321",
    product: "Embroidered Kurti",
    productId: 105,
    orderNo: "#ORD-00253",
    rating: 2,
    title: "Not satisfied",
    review:
      "The stitching quality was not as expected. Product needs improvement.",
    date: "07 Sep 2026",
    status: "Rejected",
    verified: false,
  },
  {
    id: 6,
    customer: "Tania Mukherjee",
    email: "tania@example.com",
    mobile: "9876123450",
    product: "Soft Cotton Nightwear",
    productId: 106,
    orderNo: "#ORD-00252",
    rating: 5,
    title: "Excellent",
    review:
      "Very soft material and comfortable fitting. Will definitely buy again.",
    date: "06 Sep 2026",
    status: "Approved",
    verified: true,
  },
];

function getReviewById(id: string) {
  return reviews.find((review) => review.id === Number(id));
}

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.1 3.4-6 8-6s7.2 1.9 8 6" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function StarRating({
  rating,
  size = 20,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          className={
            star <= rating ? "text-[#b88a55]" : "text-[#d8cfca]"
          }
        >
          <path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
        </svg>
      ))}
    </div>
  );
}

function statusClass(status: ReviewStatus) {
  if (status === "Approved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-red-50 text-red-700";
}

export default function ReviewDetailsPage() {
  const params = useParams();
  const id = String(params.id);

  const review = getReviewById(id);

  if (!review) {
    return (
      <div className="min-h-[calc(100vh-72px)] px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin/reviews"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6f625c] hover:text-[#292321]"
          >
            <ArrowLeftIcon />
            Back to Reviews
          </Link>

          <div className="rounded-2xl border border-[#eee6e1] bg-white p-12 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-[#292321]">
              Review Not Found
            </h1>

            <p className="mt-2 text-sm text-[#958b86]">
              The review you are looking for does not exist.
            </p>

            <Link
              href="/admin/reviews"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white hover:bg-[#403936]"
            >
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ReviewEditor review={review} />;
}

function ReviewEditor({ review }: { review: Review }) {
  const [status, setStatus] = useState<ReviewStatus>(review.status);
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title);
  const [reviewText, setReviewText] = useState(review.review);
  const [verified, setVerified] = useState(review.verified);

  function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter review title.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please enter review text.");
      return;
    }

    if (rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    console.log("Updated Review:", {
      id: review.id,
      customer: review.customer,
      product: review.product,
      rating,
      title,
      review: reviewText,
      status,
      verified,
    });

    alert("Review updated successfully.");
  }

  function approveReview() {
    setStatus("Approved");
    alert("Review approved.");
  }

  function rejectReview() {
    setStatus("Rejected");
    alert("Review rejected.");
  }

  function deleteReview() {
    const confirmed = window.confirm(
      `Are you sure you want to delete this review from ${review.customer}?`
    );

    if (!confirmed) return;

    console.log("Delete Review:", review.id);
    alert("Review deleted successfully.");
  }

  return (
    <div className="min-h-[calc(100vh-72px)] px-5 py-7 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/admin/reviews"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#756963] hover:text-[#292321]"
            >
              <ArrowLeftIcon />
              Back to Reviews
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#292321]">
                Review Details
              </h1>

              <span className="rounded-full bg-[#f4ece8] px-2.5 py-1 text-xs font-medium text-[#80665e]">
                #{review.id}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                  status
                )}`}
              >
                {status}
              </span>
            </div>

            <p className="mt-1 text-sm text-[#958b86]">
              Review submitted on {review.date}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {status !== "Approved" && (
              <button
                type="button"
                onClick={approveReview}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <CheckIcon />
                Approve
              </button>
            )}

            {status !== "Rejected" && (
              <button
                type="button"
                onClick={rejectReview}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <XIcon />
                Reject
              </button>
            )}

            <button
              type="button"
              onClick={deleteReview}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <TrashIcon />
              Delete
            </button>
          </div>
        </div>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          {/* Main Content */}
          <div className="space-y-6">
            {/* Review */}
            <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
              <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-[#292321]">
                  Customer Review
                </h2>

                <p className="mt-1 text-xs text-[#958b86]">
                  Review content submitted by the customer.
                </p>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {/* Rating */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#403936]">
                    Rating
                  </label>

                  <div className="flex flex-wrap items-center gap-4">
                    <StarRating rating={rating} size={25} />

                    <select
                      value={rating}
                      onChange={(e) =>
                        setRating(Number(e.target.value))
                      }
                      className="h-10 rounded-lg border border-[#ddd4cf] bg-white px-3 text-sm text-[#403936] outline-none focus:border-[#a9837a]"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#403936]">
                    Review Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[#ddd4cf] bg-white px-3.5 text-sm text-[#292321] outline-none placeholder:text-[#aaa09b] focus:border-[#a9837a] focus:ring-2 focus:ring-[#b56f6f]/10"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#403936]">
                    Review
                  </label>

                  <textarea
                    rows={7}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full resize-none rounded-lg border border-[#ddd4cf] bg-white px-3.5 py-3 text-sm leading-6 text-[#292321] outline-none focus:border-[#a9837a] focus:ring-2 focus:ring-[#b56f6f]/10"
                  />
                </div>
              </div>
            </section>

            {/* Customer */}
            <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
              <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4ece8] text-[#80665e]">
                    <UserIcon />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#292321]">
                      Customer Information
                    </h2>

                    <p className="text-xs text-[#958b86]">
                      Customer who submitted this review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <p className="text-xs text-[#958b86]">Customer Name</p>
                  <p className="mt-1 text-sm font-medium text-[#292321]">
                    {review.customer}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#958b86]">Email</p>
                  <p className="mt-1 text-sm text-[#514741]">
                    {review.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#958b86]">Mobile</p>
                  <p className="mt-1 text-sm text-[#514741]">
                    {review.mobile}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#958b86]">Review Date</p>
                  <p className="mt-1 text-sm text-[#514741]">
                    {review.date}
                  </p>
                </div>
              </div>
            </section>

            {/* Product */}
            <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
              <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4ece8] text-[#80665e]">
                    <ShoppingBagIcon />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#292321]">
                      Product Information
                    </h2>

                    <p className="text-xs text-[#958b86]">
                      Product associated with this review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 rounded-xl border border-[#eee6e1] bg-[#faf8f6] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#292321]">
                      {review.product}
                    </p>

                    <p className="mt-1 text-xs text-[#958b86]">
                      Product ID: #{review.productId}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#958b86]">
                      Order
                    </span>

                    <Link
                      href={`/admin/orders/${review.orderNo.replace(
                        "#ORD-",
                        ""
                      )}`}
                      className="text-sm font-medium text-[#8b625b] hover:underline"
                    >
                      {review.orderNo}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Moderation */}
            <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
              <div className="border-b border-[#eee6e1] px-5 py-4">
                <h2 className="text-base font-semibold text-[#292321]">
                  Moderation
                </h2>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#403936]">
                    Review Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as ReviewStatus)
                    }
                    className="h-11 w-full rounded-lg border border-[#ddd4cf] bg-white px-3 text-sm text-[#292321] outline-none focus:border-[#a9837a]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#eee6e1] bg-[#faf8f6] p-4">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#cfc5c0] accent-[#292321]"
                  />

                  <span>
                    <span className="block text-sm font-medium text-[#403936]">
                      Verified Purchase
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#958b86]">
                      Customer purchased this product before submitting
                      the review.
                    </span>
                  </span>
                </label>
              </div>
            </section>

            {/* Review Summary */}
            <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
              <div className="border-b border-[#eee6e1] px-5 py-4">
                <h2 className="text-base font-semibold text-[#292321]">
                  Review Summary
                </h2>
              </div>

              <div className="p-5">
                <div className="rounded-xl bg-[#faf8f6] p-5 text-center">
                  <p className="text-4xl font-semibold text-[#292321]">
                    {rating}.0
                  </p>

                  <div className="mt-2 flex justify-center">
                    <StarRating rating={rating} size={19} />
                  </div>

                  <p className="mt-2 text-xs text-[#958b86]">
                    Customer Rating
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#958b86]">
                      Status
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 font-medium ${statusClass(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#958b86]">
                      Verified
                    </span>

                    <span className="font-medium text-[#514741]">
                      {verified ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#958b86]">
                      Order
                    </span>

                    <Link
                      href="/admin/orders/257"
                      className="font-medium text-[#8b625b] hover:underline"
                    >
                      {review.orderNo}
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Save */}
            <section className="rounded-2xl border border-[#eee6e1] bg-white p-5 shadow-sm">
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936]"
              >
                Update Review
              </button>

              <Link
                href="/admin/reviews"
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#ddd4cf] bg-white text-sm font-medium text-[#514741] hover:bg-[#faf7f5]"
              >
                Cancel
              </Link>
            </section>

            {/* Danger Zone */}
            <section className="rounded-2xl border border-red-100 bg-white shadow-sm">
              <div className="border-b border-red-100 px-5 py-4">
                <h2 className="text-base font-semibold text-red-700">
                  Danger Zone
                </h2>
              </div>

              <div className="p-5">
                <p className="text-xs leading-5 text-[#958b86]">
                  Deleting this review is permanent and cannot be undone.
                </p>

                <button
                  type="button"
                  onClick={deleteReview}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <TrashIcon />
                  Delete Review
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}