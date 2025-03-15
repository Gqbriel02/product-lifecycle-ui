import styles from './Home.module.css'
import { useEffect, useState } from "react";
import NewProductModal from '../Modals/NewProductModal/NewProductModal.tsx'
import axios from "axios";
import {useNavigate} from "react-router-dom";

interface Product {
    id: number;
    name: string;
    description: string;
    stage: string;
}

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [stages, setStages] = useState<string[]>([]);
    const [selectedStage, setSelectedStage] = useState<string>("All");
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            await fetchProducts();
            await fetchStages();
        })();
    }, []);

    const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:8080/api/products", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchStages = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:8080/api/stages", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStages(["All", ...response.data.map((stage: any) => stage.name)]);
        } catch (error) {
            console.error("Error fetching stages:", error);
        }
    };

    const handleStageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value;
        setSelectedStage(selected);

        if (selected === "All") {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.stage === selected));
        }
    };

    return (
        <>
            <div className={styles.filterContainer}>
                <label htmlFor="stageFilter">Filter by Stage: </label>
                <select
                    id="stageFilter"
                    value={selectedStage}
                    onChange={handleStageChange}
                    className={styles.filterDropdown}
                >
                    {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                    ))}
                </select>
            </div>
            <div className={styles.container}>
                <div className={styles.products}>
                    {filteredProducts.map((product) => (
                        <div key={product.id} className={styles.productCard}>
                            <p><strong>ID:</strong> {product.id}</p>
                            <p><strong>NAME:</strong> {product.name}</p>
                            <p><strong>STAGE:</strong> {product.stage}</p>
                            <button className={styles.seeMoreButton} onClick={() => navigate(`/product/${product.id}`)}>SEE MORE</button>
                        </div>
                    ))}
                </div>
                <button className={styles.addButton} onClick={() => setShowModal(true)}>+</button>

                <NewProductModal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        fetchProducts();
                    }}
                />
            </div>
        </>
    );
};

export default Home
