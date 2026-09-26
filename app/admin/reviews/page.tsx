"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReviewStatus = "Pending" | "Approved" | "Rejected";

interface Review {
  id: number;
  customer: string;
  email: string;
  product: string;
  rating: number;
  title: string;
  review: string;
  date: string;
  status: ReviewStatus;
  verified: boolean;
}

const initialReviews: Review[] = [
  {
    id: 1,
    customer: "Susmita Ghosh",
    email: "susmita@example.com",
    product: "Premium Cotton Saree",
    rating: 5,
    title: "Beautiful saree",
    review:
      "Very beautiful saree. Fabric quality is excellent and the colour is exactly as shown.",
    date: "11 Sep 2026",
    status: "Approved",
    verified: true,
  },
  {
    id: 2,
    customer: "Moumita Das",
    email: "moumita@example.com",
    product: "Printed Daily Wear Kurti",
    rating: 4,
    title: "Good quality",
    review:
      "The kurti is comfortable and looks very nice. Size was also perfect.",
    date: "10 Sep 2026",
    status: "Pending",
    verified: true,
  },
  {
    id: 3,
    customer: "Riya Sen",
    email: "riya@example.com",
    product: "Floral Nightwear Set",
    rating: 5,
    title: "Very comfortable",
    review:
      "Loved the fabric. It is soft and comfortable for regular use.",
    date: "09 Sep 2026",
    status: "Approved",
    verified: true,
  },
  {
    id: 4,
    customer: "Ananya Roy",
    email: "ananya@example.com",
    product: "Designer Silk Saree",
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
    product: "Embroidered Kurti",
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
    product: "Soft Cotton Nightwear",
    rating: 5,
    title: "Excellent",
    review:
      "Very soft material and comfortable fitting. Will definitely buy again.",
    date: "06 Sep 2026",
    status: "Approved",
    verified: true,
  },
  {
    id: 7,
    customer: "Sohini Paul",
    email: "sohini@example.com",
    product: "Festive Saree Collection",
    rating: 4,
    title: "Lovely purchase",
    review:
      "Really happy with the purchase. Packaging was also very good.",
    date: "05 Sep 2026",
    status: "Pending",
    verified: true,
  },
  {
    id: 8,
    customer: "Nandini Bose",
    email: "nandini@example.com",
    product: "Casual Printed Kurti",
    rating: 5,
    title: "Amazing",
    review:
      "Beautiful print and very comfortable. Perfect for everyday wear.",
    date: "04 Sep 2026",
    status: "Approved",
    verified: false,
  },
];

// Reviews are loaded exclusively from the database.
initialReviews.length = 0;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="15"
          height="15"
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

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
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
      width="16"
      height="16"
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
      width="17"
      height="17"
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

function FilterIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  useEffect(() => {
    fetch("/api/reviews").then((response) => response.json()).then((payload) => {
      if (!payload.success) return;
      setReviews(payload.data.map((review: any) => ({ id: review.id, customer: review.name, email: review.email ?? "—", product: review.product.name, rating: review.rating, title: "Customer review", review: review.comment, date: new Date(review.createdAt).toLocaleDateString("en-IN"), status: review.approved ? "Approved" : "Pending", verified: Boolean(review.userId) })));
    }).catch(() => undefined);
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | ReviewStatus
  >("All");
  const [ratingFilter, setRatingFilter] = useState<
    "All" | "5" | "4" | "3" | "2" | "1"
  >("All");

  const stats = useMemo(() => {
    return {
      total: reviews.length,
      pending: reviews.filter((r) => r.status === "Pending").length,
      approved: reviews.filter((r) => r.status === "Approved").length,
      rejected: reviews.filter((r) => r.status === "Rejected").length,
      fiveStar: reviews.filter((r) => r.rating === 5).length,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        review.customer.toLowerCase().includes(query) ||
        review.email.toLowerCase().includes(query) ||
        review.product.toLowerCase().includes(query) ||
        review.title.toLowerCase().includes(query) ||
        review.review.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || review.status === statusFilter;

      const matchesRating =
        ratingFilter === "All" ||
        review.rating === Number(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  function updateStatus(id: number, status: ReviewStatus) {
    fetch("/api/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved: status === "Approved" }) }).catch(() => undefined);
    setReviews((current) =>
      current.map((review) =>
        review.id === id ? { ...review, status } : review
      )
    );
  }

  function deleteReview(id: number) {
    const review = reviews.find((item) => item.id === id);

    if (!review) return;

    const confirmed = window.confirm(
      `Delete review from ${review.customer}?`
    );

    if (!confirmed) return;

    fetch("/api/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => undefined);

    setReviews((current) =>
      current.filter((review) => review.id !== id)
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] px-4 py-5 lg:px-5 lg:py-6">
      <div>
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-[#292321]">
            Reviews
          </h1>

          <p className="mt-1 text-sm text-[#958b86]">
            Manage customer reviews and ratings.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-[#eee6e1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#958b86]">
              Total Reviews
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#292321]">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#958b86]">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-700">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#958b86]">
              Approved
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">
              {stats.approved}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#958b86]">
              Rejected
            </p>
            <p className="mt-2 text-2xl font-semibold text-red-700">
              {stats.rejected}
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#958b86]">
              5 Star
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#b88a55]">
              {stats.fiveStar}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-[#eee6e1] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#958b86]">
                <SearchIcon />
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, email, product or review..."
                className="h-11 w-full rounded-lg border border-[#ddd4cf] bg-white pl-10 pr-3 text-sm text-[#292321] outline-none placeholder:text-[#aaa09b] focus:border-[#a9837a] focus:ring-2 focus:ring-[#b56f6f]/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden text-[#958b86] sm:block">
                <FilterIcon />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "All" | ReviewStatus
                  )
                }
                className="h-11 rounded-lg border border-[#ddd4cf] bg-white px-3 text-sm text-[#403936] outline-none focus:border-[#a9837a]"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(
                    e.target.value as
                      | "All"
                      | "5"
                      | "4"
                      | "3"
                      | "2"
                      | "1"
                  )
                }
                className="h-11 rounded-lg border border-[#ddd4cf] bg-white px-3 text-sm text-[#403936] outline-none focus:border-[#a9837a]"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-[#eee6e1] bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-[#eee6e1] bg-[#faf8f6]">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#81756f]">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#81756f]">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#81756f]">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#81756f]">
                    Review
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#81756f]">
                    Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#81756f]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#81756f]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b border-[#f1ebe7] last:border-b-0 hover:bg-[#fcfaf9]"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#292321]">
                          {review.customer}
                        </p>

                        <p className="mt-0.5 text-xs text-[#958b86]">
                          {review.email}
                        </p>

                        {review.verified && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                            <CheckIcon />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-[190px] text-sm text-[#514741]">
                        {review.product}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <StarRating rating={review.rating} />
                        <p className="mt-1 text-xs text-[#958b86]">
                          {review.rating}/5
                        </p>
                      </div>
                    </td>

                    <td className="max-w-[300px] px-5 py-4">
                      <p className="text-sm font-medium text-[#403936]">
                        {review.title}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#958b86]">
                        {review.review}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#6f625c]">
                      {review.date}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/reviews/${review.id}`}
                          title="View review"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ddd4cf] text-[#6f625c] hover:bg-[#faf7f5]"
                        >
                          <EyeIcon />
                        </Link>

                        {review.status !== "Approved" && (
                          <button
                            type="button"
                            title="Approve"
                            onClick={() =>
                              updateStatus(review.id, "Approved")
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckIcon />
                          </button>
                        )}

                        {review.status !== "Rejected" && (
                          <button
                            type="button"
                            title="Reject"
                            onClick={() =>
                              updateStatus(review.id, "Rejected")
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XIcon />
                          </button>
                        )}

                        <button
                          type="button"
                          title="Delete"
                          onClick={() => deleteReview(review.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ddd4cf] text-[#8b7e77] hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReviews.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-[#514741]">
                No reviews found
              </p>

              <p className="mt-1 text-xs text-[#958b86]">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 lg:hidden">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-[#eee6e1] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#292321]">
                    {review.customer}
                  </p>

                  <p className="mt-0.5 text-xs text-[#958b86]">
                    {review.email}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(
                    review.status
                  )}`}
                >
                  {review.status}
                </span>
              </div>

              {review.verified && (
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                  <CheckIcon />
                  Verified Purchase
                </span>
              )}

              <div className="mt-4 rounded-xl bg-[#faf8f6] p-3">
                <p className="text-xs font-medium text-[#6f625c]">
                  {review.product}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <StarRating rating={review.rating} />

                  <span className="text-[11px] text-[#958b86]">
                    {review.date}
                  </span>
                </div>

                <p className="mt-3 text-sm font-medium text-[#403936]">
                  {review.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#958b86]">
                  {review.review}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/admin/reviews/${review.id}`}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#ddd4cf] text-xs font-medium text-[#514741] hover:bg-[#faf7f5]"
                >
                  <EyeIcon />
                  View
                </Link>

                {review.status !== "Approved" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(review.id, "Approved")
                    }
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckIcon />
                    Approve
                  </button>
                )}

                {review.status !== "Rejected" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(review.id, "Rejected")
                    }
                    className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XIcon />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => deleteReview(review.id)}
                  className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-[#ddd4cf] text-[#8b7e77] hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="rounded-2xl border border-[#eee6e1] bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-sm font-medium text-[#514741]">
                No reviews found
              </p>

              <p className="mt-1 text-xs text-[#958b86]">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* Result Count */}
        <div className="mt-4 flex items-center justify-between text-xs text-[#958b86]">
          <span>
            Showing {filteredReviews.length} of {reviews.length} reviews
          </span>
        </div>
      </div>
    </div>
  );
}
