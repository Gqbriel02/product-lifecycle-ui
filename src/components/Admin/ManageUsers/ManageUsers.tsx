import { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import DataTable from "react-data-table-component";
import styles from "./ManageUsers.module.css";
import ErrorMessage from "../../Error/Error.tsx"

Modal.setAppElement("#root");

interface Role {
    id: number;
    roleName: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phoneNumber: string;
    roles: Role[];
}

const ManageUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);
    const [selectedAvailableRoles, setSelectedAvailableRoles] = useState<Role[]>([]);
    const [selectedAssignedRoles, setSelectedAssignedRoles] = useState<Role[]>([]);
    const [initialUserState, setInitialUserState] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        username: "",
        email: "",
        phoneNumber: "",
        password: "",
        roles: [] as Role[],
    });

    useEffect(() => {
        (async () => {
            await fetchUsers();
            await fetchRoles();
        })();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:8080/api/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const fetchRoles = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:8080/api/roles", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles", error);
        }
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        const filteredData = users.filter((user) =>
            Object.values(user).some(
                (value) =>
                    value &&
                    (Array.isArray(value)
                            ? value.map((role) => role.roleName.toLowerCase()).join(", ").includes(query)
                            : value.toString().toLowerCase().includes(query)
                    )
            )
        );

        setFilteredUsers(filteredData);
    };

    const openEditModal = (user: User) => {
        const deepCopiedUser = JSON.parse(JSON.stringify(user));
        setSelectedUser(deepCopiedUser);
        setInitialUserState(deepCopiedUser);

        const userRoleIds = user.roles.map((r: Role) => r.id);
        setAssignedRoles(roles.filter(role => userRoleIds.includes(role.id)));
        setAvailableRoles(roles.filter(role => !userRoleIds.includes(role.id)));

        setEditModalIsOpen(true);
        setSelectedAvailableRoles([]);
        setSelectedAssignedRoles([]);
    };

    const openDeleteModal = (user: User) => {
        if (!user) return;
        setSelectedUser(user);
        setDeleteModalIsOpen(true);
    };

    const openCreateModal = () => {
        setNewUser({
            name: "",
            username: "",
            email: "",
            phoneNumber: "",
            password: "",
            roles: [],
        });

        setAvailableRoles(roles);
        setAssignedRoles([]);
        setSelectedAvailableRoles([]);
        setSelectedAssignedRoles([]);
        setCreateModalIsOpen(true);
        setErrorMessage("");
    };

    const closeEditModal = () => {
        setSelectedUser(null);
        setEditModalIsOpen(false);
    };

    const closeDeleteModal = () => {
        setSelectedUser(null);
        setDeleteModalIsOpen(false);
    };

    const closeCreateModal = () => {
        setCreateModalIsOpen(false);
    };

    const handleEdit = async () => {
        if (!selectedUser || !initialUserState) return;

        const token = localStorage.getItem("token");

        const updatedFields: Partial<User> = {
            email: selectedUser.email,
            phoneNumber: selectedUser.phoneNumber,
            name: selectedUser.name,
            username: selectedUser.username,
            roles: assignedRoles.map(role => ({ id: role.id, roleName: role.roleName }))
        };

        if (selectedUser.name !== initialUserState.name) {
            updatedFields.name = selectedUser.name;
        }
        if (selectedUser.username !== initialUserState.username) {
            updatedFields.username = selectedUser.username;
        }
        if (selectedUser.phoneNumber !== initialUserState.phoneNumber) {
            updatedFields.phoneNumber = selectedUser.phoneNumber;
        }

        const newRoleIds = assignedRoles.map(role => role.id);
        const oldRoleIds = initialUserState.roles.map(role => role.id);

        if (JSON.stringify(newRoleIds) !== JSON.stringify(oldRoleIds)) {
            updatedFields.roles = assignedRoles.map(role => ({ id: role.id, roleName: role.roleName }));
        }

        console.log("Updated Fields: ", updatedFields);

        if (Object.keys(updatedFields).length === 0) {
            console.log("No changes detected, skipping update.");
            closeEditModal();
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/users/${selectedUser.id}`,
                updatedFields,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("API Response: ", response);

            fetchUsers();
            closeEditModal();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const toggleRoleSelection = (role: Role, type: "available" | "assigned") => {
        if (type === "available") {
            setSelectedAvailableRoles(prev =>
                prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
            );
        } else {
            setSelectedAssignedRoles(prev =>
                prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
            );
        }
    };

    const addRoles = () => {
        setAssignedRoles([...assignedRoles, ...selectedAvailableRoles]);
        setAvailableRoles(availableRoles.filter(role => !selectedAvailableRoles.includes(role)));
        setSelectedAvailableRoles([]);
    };

    const removeRoles = () => {
        setAvailableRoles([...availableRoles, ...selectedAssignedRoles]);
        setAssignedRoles(assignedRoles.filter(role => !selectedAssignedRoles.includes(role)));
        setSelectedAssignedRoles([]);
    };


    const handleDelete = async () => {
        if (!selectedUser) return;

        const token = localStorage.getItem("token");
        if (selectedUser) {
            try {
                await axios.delete(`http://localhost:8080/api/users/${selectedUser.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchUsers();
                closeDeleteModal();
            } catch (error) {
                console.error("Error deleting user", error);
            }
        }
    };

    const handleCreateUser = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!newUser.name || !newUser.username || !newUser.email || !newUser.phoneNumber || !newUser.password) {
            setErrorMessage("All fields are required.");
            return;
        }

        if (!emailRegex.test(newUser.email)) {
            setErrorMessage("Invalid email format. Please enter a valid email.");
            return;
        }

        const token = localStorage.getItem("token");
        const userPayload = {
            ...newUser,
            roles: assignedRoles.map((role) => ({ id: role.id, roleName: role.roleName })),
        };

        try {
            await axios.post("http://localhost:8080/api/users", userPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            fetchUsers();
            closeCreateModal();
        } catch (error) {
            console.error("Error creating user:", error);
            setErrorMessage("Failed to create user. Please try again.");
        }
    };

    const columns = [
        { name: "ID", selector: (row: User) => row.id, sortable: true, width: '80px' },
        { name: "Name", selector: (row: User) => row.name, sortable: true },
        { name: "Username", selector: (row: User) => row.username, sortable: true },
        { name: "Email", selector: (row: User) => row.email, sortable: true, wrap: true },
        { name: "Phone", selector: (row: User) => row.phoneNumber, sortable: true },
        { name: "Roles", selector: (row: User) => row.roles.length ? row.roles.map(role => role.roleName).join(", ") : "No roles", sortable: true, wrap: true },
        {
            name: "Actions",
            cell: (row: User) => {
                return (
                    <div>
                        <button className={styles.editButton} onClick={() => openEditModal(row)}>
                            Edit
                        </button>
                        <button
                            className={styles.deleteButton}
                            onClick={() => openDeleteModal(row)}
                            disabled={row.roles.some(role => role.roleName === "Admin")}
                        >
                            Delete
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <h2>Manage Users</h2>
            <DataTable columns={columns} data={searchQuery ? filteredUsers : users}
                       fixedHeader fixedHeaderScrollHeight="300px" highlightOnHover subHeader
                       subHeaderComponent={
                           <input
                               type="text"
                               placeholder="Search..."
                               value={searchQuery}
                               onChange={handleSearch}
                               className={styles.searchInput}
                           />
                       }/>

            {/* Create User Button */}
            <div className={styles.createUserContainer}>
                <button className={styles.createUserButton} onClick={openCreateModal}>+ Create User</button>
            </div>

            {/* Create User Modal */}
            <Modal isOpen={createModalIsOpen} onRequestClose={closeCreateModal} className={styles.modalContent} overlayClassName={styles.modalOverlay}>
                <h2 className={styles.modalTitle}>Create User</h2>
                <div className={styles.errorDiv}>
                    {errorMessage && <ErrorMessage errorMessage={errorMessage}></ErrorMessage>}
                </div>

                <div className={styles.inputGroup}>
                    <input type="text" name="name" placeholder="Full Name" value={newUser.name} onChange={handleInputChange}/>

                    <input type="text" name="username" placeholder="Username" value={newUser.username} onChange={handleInputChange}/>

                    <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={handleInputChange}/>

                    <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleInputChange}/>

                    <input type="number" name="phoneNumber" placeholder="Phone Number" value={newUser.phoneNumber} onChange={handleInputChange}/>

                    {/* Role Selection */}
                    <div className={styles.roleContainer}>
                        <div className={styles.rBox}>
                            <h4>Available Roles</h4>
                            <div className={styles.roleBox}>
                                {availableRoles.map(role => (
                                    <button key={role.id}
                                            className={`${styles.roleItem} ${selectedAvailableRoles.includes(role) ? styles.selectedRole : ""}`}
                                            onClick={() => toggleRoleSelection(role, "available")}>
                                        {role.roleName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.roleButtons}>
                            <button onClick={addRoles} disabled={(selectedAvailableRoles.length || []) === 0}>→</button>
                            <button onClick={removeRoles} disabled={(selectedAssignedRoles.length || []) === 0}>←
                            </button>
                        </div>

                        <div className={styles.rBox}>
                            <h4>Assigned Roles</h4>
                            <div className={styles.roleBox}>
                                {assignedRoles.map(role => (
                                    <button key={role.id}
                                            className={`${styles.roleItem} ${selectedAssignedRoles.includes(role) ? styles.selectedRole : ""}`}
                                            onClick={() => toggleRoleSelection(role, "assigned")}>
                                        {role.roleName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={styles.saveButton} onClick={handleCreateUser}>Create</button>
                    <button className={styles.cancelButton} onClick={closeCreateModal}>Cancel</button>
                </div>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={editModalIsOpen} onRequestClose={closeEditModal} className={styles.modalContent}
                   overlayClassName={styles.modalOverlay}>
                <h2 className={styles.modalTitle}>Edit User</h2>
                {selectedUser && (
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Full Name</label>
                        <input type="text" value={selectedUser.name}
                               onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}/>
                        <label className={styles.inputLabel}>Username</label>
                        <input type="text" value={selectedUser.username}
                               onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}/>
                        <label className={styles.inputLabel}>Email</label>
                        <input type="email" value={selectedUser.email} disabled/>
                        <label className={styles.inputLabel}>Phone Number</label>
                        <input type="number" value={selectedUser.phoneNumber}
                               onChange={(e) => setSelectedUser({...selectedUser, phoneNumber: e.target.value})}/>

                        <div className={styles.roleContainer}>
                            <div className={styles.rBox}>
                                <h4>Available Roles</h4>
                                <div className={styles.roleBox}>
                                    {availableRoles.map(role => (
                                        <button key={role.id}
                                                className={`${styles.roleItem} ${selectedAvailableRoles.includes(role) ? styles.selectedRole : ""}`}
                                                onClick={() => toggleRoleSelection(role, "available")}>
                                            {role.roleName}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.roleButtons}>
                                <button onClick={addRoles} disabled={(selectedAvailableRoles.length || []) === 0}>→</button>
                                <button onClick={removeRoles} disabled={(selectedAssignedRoles.length || [])=== 0}>←</button>
                            </div>

                            <div className={styles.rBox}>
                                <h4>Assigned Roles</h4>
                                <div className={styles.roleBox}>
                                    {assignedRoles.map(role => (
                                        <button key={role.id}
                                                className={`${styles.roleItem} ${selectedAssignedRoles.includes(role) ? styles.selectedRole : ""}`}
                                                onClick={() => toggleRoleSelection(role, "assigned")}>
                                            {role.roleName}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
                <div className={styles.buttonGroup}>
                    <button className={styles.saveButton} onClick={handleEdit}>Save</button>
                    <button className={styles.cancelButton} onClick={closeEditModal}>Cancel</button>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteModalIsOpen} onRequestClose={closeDeleteModal} className={styles.modalContent}
                   overlayClassName={styles.modalOverlay}>
                {selectedUser ? (
                    <>
                        <h2 className={styles.modalTitle}>Confirm Deletion</h2>
                        <p>Are you sure you want to delete user: <br/>
                            <strong>{selectedUser.name} - {selectedUser.email}</strong>?
                        </p>
                        <br/>
                        <div className={styles.buttonGroup}>
                            <button className={styles.deleteConfirmButton} onClick={handleDelete}>Delete</button>
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

export default ManageUsers;
