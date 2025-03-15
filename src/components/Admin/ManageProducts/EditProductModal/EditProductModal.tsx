import { useEffect, useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import styles from "./EditProductModal.module.css";
import AvailableMaterialsModal from "../../../Modals/AvailableMaterialsModal/AvailableMaterialsModal.tsx";
import DataTable from "react-data-table-component";
import ErrorMessage from "../../../Error/Error.tsx";

Modal.setAppElement("#root");

interface Material {
    materialNumber: string;
    materialDescription: string;
    weight: number;
    width: number;
    height: number;
    quantity: number;
    unit: string;
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedProduct: {
        id: number;
        name: string;
        description: string;
        estimatedHeight: number;
        estimatedWidth: number;
        estimatedWeight: number;
        stage: string;
    } | null;
}

const EditProductModal = ({ isOpen, onClose, selectedProduct }: EditProductModalProps) => {
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        height: "",
        width: "",
        weight: "",
    });

    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

    const [currentStage, setCurrentStage] = useState<string | null>(null);
    const [stages, setStages] = useState<{ id: number; name: string }[]>([]);


    // **Load existing product details when modal opens**
    useEffect(() => {
        if (isOpen && selectedProduct) {
            setProductData({
                name: selectedProduct.name,
                description: selectedProduct.description,
                height: selectedProduct.estimatedHeight?.toString() || "",
                width: selectedProduct.estimatedWidth?.toString() || "",
                weight: selectedProduct.estimatedWeight?.toString() || "",
            });

            fetchStages();
            fetchProductStage(selectedProduct.id);
            fetchProductMaterials(selectedProduct.id);
        }
    }, [isOpen, selectedProduct]);

    // Fetch assigned materials for the product
    const fetchProductMaterials = async (productId: number) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`http://localhost:8080/api/products/${productId}/materials`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const formattedMaterials = response.data.map((item: any) => ({
                materialNumber: item.material.materialNumber || "N/A",
                materialDescription: item.material.materialDescription || "N/A",
                quantity: item.qty !== undefined ? item.qty : 1,
                unit: item.unitMeasureCode || "",
                weight: item.material.weight !== undefined ? item.material.weight : 0,
                width: item.material.width !== undefined ? item.material.width : 0,
                height: item.material.height !== undefined ? item.material.height : 0,
            }));

            setSelectedMaterials(formattedMaterials);
        } catch (error) {
            console.error("Error fetching product materials: ", error);
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

    const fetchProductStage = async (productId: number) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(`http://localhost:8080/api/products/${productId}/stage`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCurrentStage(response.data);
        } catch (error) {
            console.error("Error fetching product stage:", error);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string | null } = {};

        if (!productData.name.trim()) newErrors.name = "Product name is required.";
        if (!productData.description.trim()) newErrors.description = "Description is required.";
        if (!productData.height || isNaN(parseFloat(productData.height))) newErrors.height = "Valid height is required.";
        if (!productData.width || isNaN(parseFloat(productData.width))) newErrors.width = "Valid width is required.";
        if (!productData.weight || isNaN(parseFloat(productData.weight))) newErrors.weight = "Valid weight is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateProduct = async () => {
        if (!validateForm() || !selectedProduct) {
            console.error("Validation failed or product not selected.");
            return;
        }

        const token = localStorage.getItem("token");

        const updatedProductData = {
            name: productData.name,
            description: productData.description,
            estimatedHeight: parseFloat(productData.height),
            estimatedWidth: parseFloat(productData.width),
            estimatedWeight: parseFloat(productData.weight),
            materials: selectedMaterials.map(material => ({
                materialNumber: material.materialNumber,
                qty: material.quantity || 1,
                unitMeasureCode: material.unit || "N/A"
            })),
        };

        try {
            const response = await axios.put(
                `http://localhost:8080/api/products/${selectedProduct.id}`,
                updatedProductData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );
            console.log("Product updated successfully: ", response.data);
            onClose();
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const handleUpdateStage = async () => {
        if (!selectedProduct) return;

        const selectedStage = stages.find((stage) => stage.name === currentStage);
        if (!selectedStage) return;

        if (currentStage === selectedProduct.stage) {
            console.log("Stage not modified. Skipping update.");
            return;
        }

        try {
            await axios.put(
                `http://localhost:8080/api/products/${selectedProduct.id}/stage?stageId=${selectedStage.id}`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            console.log("Stage updated successfully");
        } catch (error) {
            console.error("Error updating stage:", error);
        }
    };

    const handleSaveMaterials = (newMaterials: Material[]) => {
        const updatedMaterials = newMaterials.map((material) => ({
            ...material,
            quantity: material.quantity || 1,
            unit: material.unit || "",
        }));
        setSelectedMaterials(updatedMaterials);
        setMaterialModalOpen(false);
    };

    const handleQuantityChange = (index: number, value: number) => {
        setSelectedMaterials((prevMaterials) =>
            prevMaterials.map((material, i) =>
                i === index ? { ...material, quantity: Math.max(value, 1) } : material
            )
        );
    };

    const handleUnitChange = (index: number, unit: string) => {
        setSelectedMaterials((prevMaterials) =>
            prevMaterials.map((material, i) =>
                i === index ? { ...material, unit } : material
            )
        );
    };

    const handleDeleteMaterial = (index: number) => {
        setSelectedMaterials((prevMaterials) => prevMaterials.filter((_, i) => i !== index));
    };

    const columns = [
        { name: "ID", selector: (row: Material) => row.materialNumber, sortable: true, wrap: true },
        { name: "Material", selector: (row: Material) => row.materialDescription, sortable: true, wrap: true },
        {
            name: "Quantity",
            cell: (row: Material, index: number) => (
                <div className={styles.quantityContainer}>
                    <button className={styles.quantityButton} onClick={() => handleQuantityChange(index, row.quantity - 1)}>-</button>
                    <input
                        type="number"
                        className={styles.quantityInput}
                        value={row.quantity}
                        onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                    />
                    <button className={styles.quantityButton} onClick={() => handleQuantityChange(index, row.quantity + 1)}>+</button>
                </div>
            ),
        },
        {
            name: "Unit",
            cell: (row: Material, index: number) => (
                <input
                    type="text"
                    className={styles.unitInput}
                    value={row.unit}
                    placeholder="Enter unit"
                    onChange={(e) => handleUnitChange(index, e.target.value)}
                />
            ),
        },
        {
            name: "DEL",
            cell: (_: Material, index: number) => (
                <button className={styles.deleteButton} onClick={() => handleDeleteMaterial(index)}>X</button>
            ),
        },
    ];

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className={styles.modalContent}
               overlayClassName={styles.modalOverlay}>
            <h2 className={styles.modalTitle}>Edit Product</h2>
            <div className={styles.editProductForm}>
                <div className={`${styles.formField} ${styles.mediumField}`}>
                    <label className={styles.inputLabel}>Product Name</label>
                    <input type="text" name="name" value={productData.name} onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.name}/>
                </div>
                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Product Stage</label>
                    <select
                        className={styles.selectInput}
                        value={currentStage || ""}
                        onChange={(e) => setCurrentStage(e.target.value)}
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
                    <input type="text" name="description" value={productData.description} onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.description}/>
                </div>
                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Height</label>
                    <input type="number" name="height" value={productData.height} onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.height}/>
                </div>
                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Width</label>
                    <input type="number" name="width" value={productData.width} onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.width}/>
                </div>
                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Weight</label>
                    <input type="number" name="weight" value={productData.weight} onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.weight}/>
                </div>
            </div>

            <button className={styles.addMaterialButton} onClick={() => setMaterialModalOpen(true)}>Edit Materials
            </button>

            {selectedMaterials.length > 0 && (
                <div className={styles.dataTableContainer}>
                    <DataTable columns={columns} data={selectedMaterials} highlightOnHover fixedHeader
                               fixedHeaderScrollHeight="200px"/>
                </div>
            )}

            <AvailableMaterialsModal isOpen={isMaterialModalOpen} onClose={() => setMaterialModalOpen(false)}
                                     onSave={handleSaveMaterials} preSelectedMaterials={selectedMaterials}/>

            <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => {
                    handleUpdateProduct();
                    handleUpdateStage();
                }}>
                    Update
                </button>
                <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
            </div>
        </Modal>
    );
};

export default EditProductModal;
