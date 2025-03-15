import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import styles from "./AvailableMaterialsModal.module.css";

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

interface AvailableMaterialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedMaterials: Material[]) => void;
    preSelectedMaterials: Material[];
}

const AvailableMaterialsModal = ({ isOpen, onClose, onSave, preSelectedMaterials  }: AvailableMaterialsModalProps) => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [tempSelectedMaterials, setTempSelectedMaterials] = useState<Material[]>([]);

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTempSelectedMaterials(preSelectedMaterials);
        }
    }, [isOpen, preSelectedMaterials]);

    const fetchMaterials = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:8080/api/materials", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMaterials(response.data);
        } catch (error) {
            console.error("Error fetching materials:", error);
        }
    };

    const toggleMaterialSelection = (material: Material) => {
        setTempSelectedMaterials((prevSelected) => {
            if (prevSelected.some((m) => m.materialNumber === material.materialNumber)) {
                return prevSelected.filter((m) => m.materialNumber !== material.materialNumber);
            } else {
                return [...prevSelected, material];
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className={styles.modalContent} overlayClassName={styles.modalOverlay}>
            <h2 className={styles.modalTitle}>AVAILABLE MATERIALS</h2>
            <div className={styles.materialList}>
                {materials.map((material) => (
                    <div
                        key={material.materialNumber}
                        className={`${styles.materialItem} ${
                            tempSelectedMaterials.some((m) => m.materialNumber === material.materialNumber) ? styles.selected : ""
                        }`}
                        onClick={() => toggleMaterialSelection(material)}
                    >
                        {material.materialNumber} - {material.materialDescription}
                    </div>
                ))}
            </div>
            <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={() => onSave(tempSelectedMaterials)}>SAVE</button>
                <button className={styles.cancelButton} onClick={onClose}>CANCEL</button>
            </div>
        </Modal>
    );
};

export default AvailableMaterialsModal;
