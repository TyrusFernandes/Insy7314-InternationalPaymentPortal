import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import DOMPurify from "dompurify";

function EmployeeDashboard({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

  useEffect(() => {
    const fetchTransactionsWithCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const rawTxns = querySnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Fetch all customers in parallel
        const enrichedTxns = await Promise.all(
          rawTxns.map(async (txn) => {
            const cleanUserId = DOMPurify.sanitize(txn.userId || "");
            let customerName = "Unknown";

            if (cleanUserId) {
              try {
                const custRef = doc(db, "customers", cleanUserId);
                const custSnap = await getDoc(custRef);
                if (custSnap.exists()) {
                  const cust = custSnap.data();
                  customerName = cust.fullName || cust.username || "Unknown";
                }
              } catch (err) {
                console.warn("Error fetching customer:", err);
              }
            }

            return { ...txn, customer: customerName };
          })
        );

        setTransactions(enrichedTxns);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionsWithCustomers();
  }, []);

  const verifySwift = (swiftCode) => swiftRegex.test(swiftCode);

  const handleSubmitToSWIFT = async (txn) => {
    const cleanId = DOMPurify.sanitize(txn.id);
    const cleanSwift = DOMPurify.sanitize(txn.swiftCode);

    if (!verifySwift(cleanSwift)) {
      alert("Invalid SWIFT code. Please review before submission.");
      return;
    }

    setUpdating((prev) => ({ ...prev, [cleanId]: true }));

    try {
      const ref = doc(db, "transactions", cleanId);
      await updateDoc(ref, {
        status: "Forwarded to SWIFT",
        verifiedAt: new Date(),
        verifiedBy: auth.currentUser?.uid || "employee",
      });

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === cleanId ? { ...t, status: "Forwarded to SWIFT" } : t
        )
      );

      alert(`Transaction ${cleanId} submitted to SWIFT ✅`);
    } catch (error) {
      console.error("Error updating transaction:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [cleanId]: false }));
    }
  };

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="employee-dashboard" style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Employee Transaction Portal</h1>
      <button onClick={onLogout} style={{ marginBottom: "1rem" }}>
        Log Out
      </button>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table style={{ margin: "0 auto", borderCollapse: "collapse", width: "90%" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333" }}>
              <th>Customer</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Account</th>
              <th>SWIFT</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{txn.customer}</td>
                <td>{txn.amount}</td>
                <td>{txn.currency}</td>
                <td>{txn.payeeAccount}</td>
                <td>{txn.swiftCode}</td>
                <td>{txn.status}</td>
                <td>
                  {txn.status === "Pending SWIFT Verification" ? (
                    <button
                      onClick={() => handleSubmitToSWIFT(txn)}
                      disabled={updating[txn.id]}
                    >
                      {updating[txn.id] ? "Submitting..." : "Submit to SWIFT"}
                    </button>
                  ) : (
                    <span>✅ Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeDashboard;
