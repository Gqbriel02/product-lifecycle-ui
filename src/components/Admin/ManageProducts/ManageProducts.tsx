import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import DataTable from "react-data-table-component";
import styles from "./ManageProducts.module.css";
import NewProductModal from "../../Modals/NewProductModal/NewProductModal.tsx";
import EditProductModal from "./EditProductModal/EditProductModal.tsx";

Modal.setAppElement("#root");

interface Product {
    id: number;
    name: string;
    description: string;
    estimatedHeight: number;
    estimatedWidth: number;
    estimatedWeight: number;
    stage: string;
}

const ManageProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:8080/api/products", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        const filteredData = products.filter((product) =>
            Object.values(product).some(
                (value) => value && value.toString().toLowerCase().includes(query)
            )
        );

        setFilteredProducts(filteredData);
    };

    const openDeleteModal = (product: Product) => {
        setSelectedProduct(product);
        setDeleteModalIsOpen(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setEditModalIsOpen(true);
    };

    const openCreateModal = () => {
        setCreateModalIsOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setSelectedProduct(null);
    };

    const closeEditModal = () => {
        setEditModalIsOpen(false);
        setSelectedProduct(null);
    };

    const closeCreateModal = () => {
        setCreateModalIsOpen(false);
    };

    const handleDeleteProduct = async () => {
        if (!selectedProduct) return;

        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8080/api/products/${selectedProduct.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProducts();
            closeDeleteModal();
        } catch (error) {
            console.error("Error deleting product", error);
        }
    };

    const columns = [
        { name: "ID", selector: (row: Product) => row.id, sortable: true, width: "80px" },
        { name: "Name", selector: (row: Product) => row.name, sortable: true, wrap: true },
        { name: "Description", selector: (row: Product) => row.description, sortable: true, wrap: true, width: "150px" },
        { name: "Height", selector: (row: Product) => row.estimatedHeight ?? "N/A", sortable: true, width: "100px" },
        { name: "Width", selector: (row: Product) => row.estimatedWidth ?? "N/A", sortable: true, width: "80px" },
        { name: "Weight", selector: (row: Product) => row.estimatedWeight ?? "N/A", sortable: true, width: "100px" },
        { name: "Stage", selector: (row: Product) => row.stage, sortable: true, width: "100px" },
        {
            name: "Actions",
            cell: (row: Product) => (
                <div>
                    <button className={styles.editButton} onClick={() => openEditModal(row)}>Edit</button>
                    <button className={styles.deleteButton} onClick={() => openDeleteModal(row)}>Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h2>Manage Products</h2>
            <DataTable
                columns={columns}
                data={searchQuery ? filteredProducts : products}
                fixedHeader
                fixedHeaderScrollHeight="300px"
                highlightOnHover
                subHeader
                subHeaderComponent={
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearch} className={styles.searchInput} />
                }
            />

            {/* Create Product Button */}
            <div className={styles.createProductContainer}>
                <button className={styles.createProductButton} onClick={openCreateModal}>+ Create Product</button>
            </div>

            {/* Create Product Modal */}
            <NewProductModal
                isOpen={createModalIsOpen}
                onClose={() => {
                    closeCreateModal();
                    fetchProducts();
                }}
            />

            {/* Edit Product Modal */}
            <EditProductModal
                isOpen={editModalIsOpen}
                onClose={() => {
                    closeEditModal();
                    fetchProducts();
                }}
                selectedProduct={selectedProduct}
            />

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModalIsOpen} onRequestClose={closeDeleteModal} className={styles.modalContent} overlayClassName={styles.modalOverlay}>
                {selectedProduct ? (
                    <>
                        <h2 className={styles.modalTitle}>Confirm Deletion</h2>
                        <p>Are you sure you want to delete product: <br/>
                            <strong>{selectedProduct.name}</strong>?
                        </p>
                        <br/>
                        <div className={styles.buttonGroup}>
                            <button className={styles.deleteConfirmButton} onClick={handleDeleteProduct}>Delete</button>
                            <button className={styles.cancelButton} onClick={closeDeleteModal}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </Modal>
        </div>
    );
};

export default ManageProducts;
