import React from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const SmallSelectNew = ({
    maxWidth = "150px",
    isCreatable = false,
    onChange,
    ...props
}) => {
    const SelectComponent = isCreatable ? CreatableSelect : Select;

    return (
        <div style={{ maxWidth, marginTop: "4px" }}>
            <SelectComponent
                {...props}
                onChange={(option) => onChange?.(option || null)}
                styles={{
                    control: (provided) => ({
                        ...provided,
                        minHeight: "30px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        padding: "0 2px",
                        background: "var(--card-bg)",
                        color: "var(--text)",
                        borderColor: "var(--border)",
                        boxShadow: "none",
                    }),
                    valueContainer: (p) => ({ ...p, padding: "0 6px" }),
                    placeholder: (p) => ({ ...p, fontSize: "12px", color: "#9ca3af" }),
                    input: (p) => ({ ...p, fontSize: "12px", color: "var(--text)" }),
                    singleValue: (p) => ({ ...p, fontSize: "12px", color: "var(--text)" }),
                    menu: (p) => ({
                        ...p,
                        fontSize: "12px",
                        borderRadius: "8px",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
                        background: "var(--card-bg)",
                        overflow: "hidden",
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        fontSize: "12px",
                        padding: "8px 10px",
                        backgroundColor: state.isSelected
                            ? "var(--primary)"
                            : state.isFocused
                                ? "var(--hover-bg)"
                                : "var(--card-bg)",
                        color: state.isSelected ? "var(--card-bg)" : "var(--text)",
                        cursor: "pointer",
                    }),
                }}
                theme={(theme) => ({
                    ...theme,
                    colors: {
                        ...theme.colors,
                        primary: "var(--primary)",
                        primary25: "var(--hover-bg)",
                        neutral0: "var(--card-bg)",
                        neutral80: "var(--text)",
                        neutral20: "var(--border)",
                    },
                })}
                isSearchable={props.isSearchable ?? false}
            />
        </div>
    );
};

export default SmallSelectNew;
