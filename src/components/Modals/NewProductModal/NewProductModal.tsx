import {useEffect, useState} from "react";
import Modal from "react-modal";
import axios from "axios";
import styles from "./NewProductModal.module.css";
import AvailableMaterialsModal from "../AvailableMaterialsModal/AvailableMaterialsModal";
import DataTable from "react-data-table-component";
import ErrorMessage from "../../Error/Error"

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

interface NewProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewProductModal = ({ isOpen, onClose }: NewProductModalProps) => {
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

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setProductData({
            name: "",
            description: "",
            height: "",
            width: "",
            weight: "",
        });
        setSelectedMaterials([]);
        setErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: null });
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

    const handleSaveProduct = async () => {
        if (!validateForm()) {
            console.error("Form validation failed.");
            return;
        }

        const token = localStorage.getItem("token");

        const formattedProductData = {
            name: productData.name,
            description: productData.description,
            estimatedHeight: productData.height ? parseFloat(productData.height) : null,
            estimatedWidth: productData.width ? parseFloat(productData.width) : null,
            estimatedWeight: productData.weight ? parseFloat(productData.weight) : null,
            materials: selectedMaterials.length > 0 ? selectedMaterials.map(material => ({
                materialNumber: material.materialNumber,
                qty: material.quantity || 1,
                unitMeasureCode: material.unit || "N/A"
            })) : []
        };

        try {
            const response = await axios.post(
                "http://localhost:8080/api/products",
                formattedProductData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );
            console.log("Product created successfully: ", response.data);
            onClose();
        } catch (error) {
            console.error("Error creating product:", error);
        }
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
            <h2 className={styles.modalTitle}>Create a New Product</h2>
            <div className={styles.newProductForm}>
                <div className={`${styles.formField} ${styles.largeField}`}>
                    <label className={styles.inputLabel}>Product Name</label>
                    <input type="text" name="name" placeholder="Name" value={productData.name}
                           onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.name} />
                </div>
                <div className={`${styles.formField} ${styles.largeField}`}>
                    <label className={styles.inputLabel}>Description</label>
                    <input type="text" name="description" placeholder="Description" value={productData.description}
                           onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.description} />
                </div>
                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Height</label>
                    <input type="number" name="height" placeholder="Height" value={productData.height}
                           onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.height} />
                </div>
                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Width</label>
                    <input type="number" name="width" placeholder="Width" value={productData.width}
                           onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.width} />
                </div>
                <div className={`${styles.formField} ${styles.smallField}`}>
                    <label className={styles.inputLabel}>Weight</label>
                    <input type="number" name="weight" placeholder="Weight" value={productData.weight}
                           onChange={handleInputChange}/>
                    <ErrorMessage errorMessage={errors.weight} />
                </div>
            </div>

            <button className={styles.addMaterialButton} onClick={() => setMaterialModalOpen(true)}>Add Material</button>

                {selectedMaterials.length > 0 && (
                    <div className={styles.dataTableContainer}>
                        <DataTable columns={columns} data={selectedMaterials} highlightOnHover fixedHeader fixedHeaderScrollHeight="200px"/>
                    </div>
                )}
                <AvailableMaterialsModal isOpen={isMaterialModalOpen} onClose={() => setMaterialModalOpen(false)}
                                         onSave={handleSaveMaterials} preSelectedMaterials={selectedMaterials}/>

            <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={handleSaveProduct}>Save</button>
                <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
            </div>
        </Modal>
    );
};

export default NewProductModal;
