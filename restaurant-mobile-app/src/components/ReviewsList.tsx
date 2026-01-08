import React, { useState, useEffect } from 'react';

interface Review {
  id: number;
  rating: number;
  comment: string;
  date: string;
}

interface Props {
  apiEndpoint: string; // Dynamic URL so both Admin and Restaurant can use it
}

const ReviewsList: React.FC<Props> = ({ apiEndpoint }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiEndpoint);
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint]);

  if (loading) return <p>Loading data...</p>;

  return (
    <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Rating</th>
          <th>Comment</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {reviews.map((r) => (
          <tr key={r.id}>
            <td>{r.rating} ⭐</td>
            <td>{r.comment}</td>
            <td>{new Date(r.date).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReviewsList;