import React, {useEffect, useState} from "react";
import {
    Paper,
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Collapse,
} from "@mui/material";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";

/** Minimal interface: each item has an id (string) */
export interface ListItemData {
    id: string;
    [key: string]: any;
}

/** Props for the reusable column list with action button */
interface ColumnListWithActionBtnProps<T extends ListItemData> {
    /** Title at the top of the list (optional). Defaults to "Items List" */
    title?: string;
    /** The array of items (with at least { id: string }) */
    items: T[];
    /** Text for the "Add" button */
    actionBtnText: string;
    actionBtnOnClick: () => void;
    /** Generates the dialog title given the next item index */
    /** Callback to add a new item by name/string. You define how it’s created. */
    selectFirstItem?: boolean;
    onAddItem: (newItemName: string) => void;

    /** Whether sorting is enabled */
    sortable?: boolean;
    /** Called after a drag-and-drop reorder, passing the new items array */
    onSort?: (newItems: T[]) => void;

    onDelete?: (item: T, index: number) => void;

    /** If provided, called when an item is clicked/selected */
    onSelect?: (selectedItem: T, index?: number) => void;

    /**
     * Optional function to render the main label/secondary text of the item.
     * By default, we'll just show `item.id` (or newItemName) in the list.
     */
    renderItemContent?: (item: T, index: number) => React.ReactNode;

    /**
     * Optional: If you want an expandable panel per item,
     * provide a function that, if non-null, shows an expand/collapse icon
     * and renders the returned content when expanded.
     */
    renderExpandedContent?: (item: T) => React.ReactNode;
    selectedItemId?: string | null; // New prop to overwrite selectedItemId

}

/** Domain-agnostic, fully reusable component */
function ColumnListWithActionBtn<T extends ListItemData>({
                                                             selectFirstItem,
                                                             sortable,
                                                             title,
                                                             actionBtnText,
                                                             items,
                                                             onDelete,
                                                             actionBtnOnClick,
                                                             onSort,
                                                             onSelect,
                                                             renderItemContent,
                                                             renderExpandedContent,
                                                             selectedItemId: externalSelectedItemId, // New prop
                                                         }: ColumnListWithActionBtnProps<T>) {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(selectFirstItem && items.length > 0 ? items[0].id : null);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (externalSelectedItemId !== undefined) {
            setSelectedItemId(externalSelectedItemId);
        }
    }, [externalSelectedItemId]);

    // Setup sensors for drag-and-drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    /** DRAG END */
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            // If we found both items, reorder them
            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = arrayMove(items, oldIndex, newIndex);
                onSort?.(newItems);
            }
        }
        setActiveId(null);
    };

    /** DRAG START */
    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const onItemDelete = (item: T, index: number) => {
        const updatedItems = [...items];
        updatedItems.splice(index, 1);
        setSelectedItemId(null);
        onDelete?.(item, index);
        onSort?.(updatedItems);
    };

    /** SELECT ITEM */
    const handleSelectItem = (item: T, index:number) => {
        setSelectedItemId(item.id);
        onSelect?.(item, index);
    };

    /** TOGGLE EXPANDED ITEM */
    const handleExpandClick = (itemId: string) => {
        setExpandedItemId((prev) => (prev === itemId ? null : itemId));
    };

    useEffect(() => {
        if (items.length > 0 && selectFirstItem) {
            // If the selected item is not in the new list, reset selection
            const currentSelectedIndex = items.findIndex(item => item.id === selectedItemId);

            if (currentSelectedIndex === -1 || selectedItemId === null) {
                setSelectedItemId(items[0].id);
                onSelect?.(items[0], 0);
            }
        } else {
            setSelectedItemId(null); // No items available, clear selection
        }
    }, [items, onSelect]);



    /** MAIN RENDER */
    return (
        <Paper elevation={3} sx={{ width: "100%", padding: 2 }}>
            {/* Heading + "Add" Button */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{title ?? "Items List"}</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={actionBtnOnClick}
                    >
                        {actionBtnText}
                    </Button>
                </Box>
            </Box>

            {/* LIST OF ITEMS */}
            {sortable ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={items.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <List>
                            {items.map((item, index) => (
                                <SortableItem<T>
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onDelete={onDelete ? () => onItemDelete(item, index) : undefined}
                                    isSelected={item.id === selectedItemId}
                                    isExpanded={item.id === expandedItemId}
                                    onSelect={() => handleSelectItem(item, index)}
                                    onExpand={() => handleExpandClick(item.id)}
                                    renderItemContent={renderItemContent}
                                    renderExpandedContent={renderExpandedContent}
                                />
                            ))}
                        </List>
                    </SortableContext>

                    {/* DRAG OVERLAY */}
                    <DragOverlay>
                        {activeId ? (
                            <ListItem
                                sx={{ backgroundColor: "#f0f0f0", border: "1px solid #ccc" }}
                            >
                                <ListItemText
                                    primary={`Dragging: ${
                                        items.find((i) => i.id === activeId)?.id ?? activeId
                                    }`}
                                />
                            </ListItem>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            ) : (
                <List>
                    {items.map((item, index) => {
                        const selected = item.id === selectedItemId;
                        const expanded = item.id === expandedItemId;
                        return (
                            <NonSortableItem<T>
                                onDelete={ onDelete ? () => onItemDelete(item, index) : undefined}
                                key={item.id}
                                item={item}
                                index={index}
                                isSelected={selected}
                                isExpanded={expanded}
                                onSelect={() => handleSelectItem(item, index)}
                                onExpand={() => handleExpandClick(item.id)}
                                renderItemContent={renderItemContent}
                                renderExpandedContent={renderExpandedContent}
                            />
                        );
                    })}
                </List>
            )}

        </Paper>
    );
}

/** --------- Sortable Item (Drag-Enabled) ---------- */

interface SortableItemProps<T extends ListItemData> {
    item: T;
    index: number;
    isSelected: boolean;
    isExpanded: boolean;
    onSelect: () => void;
    onExpand: () => void;
    renderItemContent?: (item: T, index: number) => React.ReactNode;
    renderExpandedContent?: (item: T) => React.ReactNode;
}

function SortableItem<T extends ListItemData>({
                                                  item,
                                                  index,
                                                  isSelected,
                                                  isExpanded,
                                                  onSelect,
    onDelete,
                                                  onExpand,
                                                  renderItemContent,
                                                  renderExpandedContent,
                                              }: SortableItemProps<T>) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: item.id,
    });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isSelected ? "rgba(25, 118, 210, 0.08)" : undefined,
        borderRadius: 1,
    };

    const hasExpandedContent = !!renderExpandedContent;

    return (
        <>
            <ListItem ref={setNodeRef} style={style} button selected={isSelected} onClick={onSelect}>
                <ListItemText
                    primary={
                        renderItemContent
                            ? renderItemContent(item, index)
                            : // default fallback: just show item.id
                            item.id
                    }
                />
                <Box display="flex" alignItems="center">
                    {onDelete && (
                        <Button
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(index);
                            }}
                        >
                            {<DeleteIcon/>}
                        </Button>
                    )}
                    {/* Drag Handle */}
                    <span
                        {...listeners}
                        {...attributes}
                        style={{ cursor: "grab", marginLeft: 8 }}
                        aria-label="drag-handle"
                        onClick={(e) => e.stopPropagation()} // Prevent item selection while dragging
                    >
                        ≡
                    </span>
                </Box>
            </ListItem>
            {hasExpandedContent && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                        {renderExpandedContent?.(item)}
                    </Box>
                </Collapse>
            )}
        </>
    );
}

/** --------- Non-Sortable Item (Drag-Disabled) ---------- */

interface NonSortableItemProps<T extends ListItemData> {
    item: T;
    index: number;
    isSelected: boolean;
    isExpanded: boolean;
    onSelect: () => void;
    onExpand: () => void;
    renderItemContent?: (item: T, index: number) => React.ReactNode;
    renderExpandedContent?: (item: T) => React.ReactNode;
}

function NonSortableItem<T extends ListItemData>({
                                                     item,
                                                     index,
                                                     isSelected,
                                                     isExpanded,
                                                     onSelect,
                                                     onDelete,
                                                     onExpand,
                                                     renderItemContent,
                                                     renderExpandedContent,
                                                 }: NonSortableItemProps<T>) {
    const style = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isSelected ? "rgba(25, 118, 210, 0.08)" : undefined,
        borderRadius: 1,
    };

    const hasExpandedContent = !!renderExpandedContent;

    return (
        <>
            <ListItem style={style} button selected={isSelected} onClick={onSelect}>
                <ListItemText
                    primary={
                        renderItemContent
                            ? renderItemContent(item, index)
                            : // default fallback: just show item.id
                            item.id
                    }
                />
                <Box display="flex" alignItems="center">
                    {hasExpandedContent && (
                        <Button
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand();
                            }}
                        >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </Button>
                    )}
                </Box>
                <Box display="flex" alignItems="center">
                    {onDelete && (
                        <Button
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(index);
                            }}
                        >
                            <DeleteIcon />
                        </Button>
                    )}
                </Box>
            </ListItem>
            {hasExpandedContent && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                        {renderExpandedContent?.(item)}
                    </Box>
                </Collapse>
            )}
        </>
    );
}

export default ColumnListWithActionBtn;
