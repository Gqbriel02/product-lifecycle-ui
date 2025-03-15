import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import styles from "./ProductDetails.module.css";
import DataTable from "react-data-table-component";
import Loading from "../Loading/Loading.tsx";

interface StageHistory {
    stageName: string;
    startOfStage: string;
    userId: number;
    fullName: string;
}

interface Material {
    materialNumber: string;
    materialDescription: string;
    quantity: number;
    unit: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    estimatedHeight: number;
    estimatedWidth: number;
    estimatedWeight: number;
    stage: string;
    materials: Material[];
}

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<Material[] | null>(null);
    const [stages, setStages] = useState<{ id: number; name: string }[]>([]);
    const [selectedStage, setSelectedStage] = useState<string>("");
    const [originalStage, setOriginalStage] = useState<string>("");
    const [stageHistory, setStageHistory] = useState<StageHistory[]>([]);

    const fetchStageHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get<StageHistory[]>(`http://localhost:8080/api/products/${productId}/stage-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStageHistory(response.data);
        } catch (error) {
            console.error("Error fetching stage history:", error);
        }
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(`http://localhost:8080/api/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProduct(response.data);
                setMaterials(response.data.materials || []);
                setSelectedStage(response.data.stage);
                setOriginalStage(response.data.stage);
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchStages = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get("http://localhost:8080/api/stages", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStages(response.data);
            } catch (error) {
                console.error("Error fetching stages:", error);
            }
        };

        fetchProductDetails();
        fetchStages();
        fetchStageHistory();
    }, [productId]);

    if (loading) return <Loading />;
    if (!product) return <p>Product not found.</p>;

    const handleSaveStage = async () => {
        if (!product) return;

        const selectedStageObj = stages.find(stage => stage.name === selectedStage);
        if (!selectedStageObj) {
            console.error("Invalid stage selected");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:8080/api/products/${product.id}/stage?stageId=${selectedStageObj.id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Stage updated successfully");
            setOriginalStage(selectedStage);

            await fetchStageHistory();
            alert("Stage updated successfully!");
        } catch (error) {
            console.error("Error updating stage:", error);
            alert("Failed to update stage");
        }
    };

    const handleGenerateReport = async () => {
        if (!product) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8080/api/products/${product.id}/report`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Product_${product.id}_Report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report");
        }
    };


    const materialColumns = [
        { name: "ID", selector: (row: Material) => row.materialNumber, sortable: true, wrap: true, width: "80px" },
        { name: "Material", selector: (row: Material) => row.materialDescription, sortable: true, wrap: true },
        { name: "Quantity", selector: (row: Material) => row.quantity, sortable: true, wrap: true },
        { name: "Unit", selector: (row: Material) => row.unit || "N/A", sortable: false, wrap: true },
    ];

    const stageHistoryColumns = [
        { name: "Stage Name", selector: (row: StageHistory) => row.stageName, sortable: true },
        { name: "Start Date", selector: (row: StageHistory) => new Date(row.startOfStage).toLocaleString(), sortable: true },
        { name: "User ID", selector: (row: StageHistory) => row.userId, width: "100px" },
        { name: "User Name", selector: (row: StageHistory) => row.fullName},
    ];

    return (
        <div className={styles.detailedProductContainer}>

            <div className={styles.buttonRow}>
                <button className={styles.backButton} onClick={() => navigate("/")}>
                    Back
                </button>
                <div className={styles.rightButtons}>
                    <button className={styles.reportButton} onClick={handleGenerateReport}>
                        Generate Report
                    </button>
                    <button className={styles.saveButton} onClick={handleSaveStage}
                            disabled={selectedStage === originalStage}>
                        Save
                    </button>
                </div>
            </div>


            <h2 className={styles.productTitle}>Product ID: {product.id}</h2>

            <div className={styles.detailsForm}>
                <div className={`${styles.formField} ${styles.mediumField}`}>
                    <label className={styles.inputLabel}>Product Name</label>
                    <input type="text" value={product.name} disabled/>
                </div>

                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Product Stage</label>
                    <select
                        className={styles.selectInput}
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                    >
                        {stages.map((stage) => (
                            <option key={stage.id} value={stage.name}>
                                {stage.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={`${styles.formField} ${styles.largeField}`}>
                    <label className={styles.inputLabel}>Description</label>
                    <input type="text" value={product.description} disabled/>
                </div>

                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Height</label>
                    <input type="number" value={product.estimatedHeight} disabled/>
                </div>

                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Width</label>
                    <input type="number" value={product.estimatedWidth} disabled/>
                </div>

                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Weight</label>
                    <input type="number" value={product.estimatedWeight} disabled/>
                </div>
            </div>

            <h3>Materials Used</h3>
            {materials && materials.length > 0 ? (
                <div className={styles.dataTableContainer}>
                    <DataTable
                        columns={materialColumns}
                        data={materials}
                        highlightOnHover
                        fixedHeader
                        fixedHeaderScrollHeight="200px"
                    />
                </div>
            ) : (
                <p>No materials assigned.</p>
            )}

            <h3>Stage History</h3>
            {stageHistory.length > 0 ? (
                <div className={styles.dataTableContainer}>
                    <DataTable
                        columns={stageHistoryColumns}
                        data={[...stageHistory]}
                        highlightOnHover
                        fixedHeader
                        fixedHeaderScrollHeight="200px"
                    />
                </div>
            ) : (
                <p>No stage history available.</p>
            )}
        </div>
    );
};

export default ProductDetails;
