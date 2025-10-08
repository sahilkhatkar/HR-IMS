import React from "react";
import Select from "react-select";

const SmallSelect = ({ maxWidth = "150px", ...props }) => {
    return (
        <div style={{ maxWidth, marginTop: "4px" }}>
            <Select
                {...props}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                styles={{
                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                    control: (provided) => ({
                        ...provided,
                        minHeight: "34px",
                        fontSize: "14px",
                        borderRadius: "6px",
                        padding: "0 2px",

                        borderColor: '#ccc',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#007bff' }
                    }),
                    valueContainer: (provided) => ({
                        ...provided,
                        padding: "0 6px",
                    }),
                    placeholder: (provided) => ({
                        ...provided,
                        fontSize: "14px",
                        color: "#9ca3af",
                    }),
                    input: (provided) => ({
                        ...provided,
                        fontSize: "14px",
                    }),
                    singleValue: (provided) => ({
                        ...provided,
                        fontSize: "14px",
                    }),
                    menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                        fontSize: "14px",
                        borderRadius: "6px",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        fontSize: "14px",
                        padding: "6px 10px",
                        backgroundColor: state.isSelected
                            ? "#2563eb"
                            : state.isFocused
                                ? "#eff6ff"
                                : "white",
                        color: state.isSelected ? "white" : "#111827",
                        cursor: "pointer",
                    }),
                }}
            />
        </div>
    );
};

export default SmallSelect;
