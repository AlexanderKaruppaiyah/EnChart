'use client';

import React, { useCallback, useState, useRef, DragEvent } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    MarkerType,
    Node,
    NodeProps,
    Handle,
    Position,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Square, Diamond, Circle, Hexagon, ArrowRight,
    Trash2, RotateCcw, MessageSquare, GripVertical, Plus, Info, Zap
} from 'lucide-react';

/* ─── Editable Logic Label ─── */
function EditableLabel({ data, id }: { data: { label?: string }; id: string }) {
    const { setNodes } = useReactFlow();
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(data.label || '');

    const commit = () => {
        setEditing(false);
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: text || 'Untitled Node',
                        },
                    };
                }
                return node;
            })
        );
    };

    if (editing) {
        return (
            <input
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                onBlur={commit}
                onKeyDown={e => e.key === 'Enter' && commit()}
                className="bg-transparent outline-none text-center w-full text-[12px] font-bold tracking-tight"
                style={{ color: 'inherit' }}
            />
        );
    }
    return (
        <span
            onDoubleClick={() => setEditing(true)}
            className="cursor-text select-none text-[12px] font-bold leading-tight text-center block"
            title="Double-click to edit logic"
        >
            {data.label || 'Untitled Node'}
        </span>
    );
}

/* ─── Premium Node Primitives ─── */
function ProcessNode({ data, id }: NodeProps) {
    return (
        <div className="fc-node-wrapper">
            <div className="fc-node fc-process group">
                <Handle type="target" position={Position.Top} className="!bg-brand-500" />
                <EditableLabel data={data} id={id} />
                <Handle type="source" position={Position.Bottom} className="!bg-brand-500" />
                <Handle type="source" position={Position.Right} id="right" className="!bg-brand-500" />
            </div>
        </div>
    );
}

function DecisionNode({ data, id }: NodeProps) {
    return (
        <div className="fc-node-wrapper">
            <div className="fc-node fc-decision">
                <Handle type="target" position={Position.Top} className="!bg-accent-500" />
                <div className="fc-diamond-inner">
                    <EditableLabel data={data} id={id} />
                </div>
                <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-accent-500" />
                <Handle type="source" position={Position.Right} id="right" className="!bg-accent-500" />
                <Handle type="source" position={Position.Left} id="left" className="!bg-accent-500" />
            </div>
        </div>
    );
}

function TerminalNode({ data, id }: NodeProps) {
    return (
        <div className="fc-node-wrapper">
            <div className="fc-node fc-terminal">
                <Handle type="target" position={Position.Top} className="!bg-brand-600" />
                <EditableLabel data={data} id={id} />
                <Handle type="source" position={Position.Bottom} className="!bg-brand-600" />
            </div>
        </div>
    );
}

function IONode({ data, id }: NodeProps) {
    return (
        <div className="fc-node-wrapper">
            <div className="fc-node fc-io">
                <Handle type="target" position={Position.Top} className="!bg-amber-500" />
                <EditableLabel data={data} id={id} />
                <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
            </div>
        </div>
    );
}

function ConnectorNode({ data, id }: NodeProps) {
    return (
        <div className="fc-node-wrapper">
            <div className="fc-node fc-connector">
                <Handle type="target" position={Position.Top} className="!bg-purple-500" />
                <EditableLabel data={data} id={id} />
                <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
            </div>
        </div>
    );
}

function TextNode({ data, id }: NodeProps) {
    return (
        <div className="fc-node-wrapper border-none shadow-none">
            <div className="fc-node fc-text">
                <EditableLabel data={data} id={id} />
            </div>
        </div>
    );
}

const nodeTypes = {
    process: ProcessNode,
    decision: DecisionNode,
    terminal: TerminalNode,
    io: IONode,
    connector: ConnectorNode,
    textAnnotation: TextNode,
};

/* ─── Refined Shape Palette ─── */
const SHAPES = [
    { type: 'terminal', label: 'Terminal State', icon: Circle, color: '#14b8a6', desc: 'Start/End points' },
    { type: 'process', label: 'Action / Step', icon: Square, color: '#0d9488', desc: 'Core operations' },
    { type: 'decision', label: 'Logic Gate', icon: Diamond, color: '#0ea5e9', desc: 'Binary branches' },
    { type: 'io', label: 'Input / Output', icon: ArrowRight, color: '#f59e0b', desc: 'Data pathways' },
    { type: 'connector', label: 'Logic Hook', icon: Hexagon, color: '#a855f7', desc: 'Phase links' },
    { type: 'textAnnotation', label: 'Strategy Note', icon: MessageSquare, color: '#10b981', desc: 'Annotations' },
];

function ShapePalette() {
    const onDragStart = (e: DragEvent, nodeType: string, label: string) => {
        e.dataTransfer.setData('application/reactflow-type', nodeType);
        e.dataTransfer.setData('application/reactflow-label', label);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-20 lg:w-64 bg-surface-50 border-r border-surface-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-surface-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2 text-surface-400 mb-1 lg:mb-0">
                    <Plus className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] hidden lg:block">Architecture Kit</p>
                </div>
            </div>

            <div className="flex flex-col gap-2 p-3 lg:p-4">
                {SHAPES.map(s => (
                    <div
                        key={s.type}
                        draggable
                        onDragStart={e => onDragStart(e, s.type, s.label)}
                        className="flex items-center gap-4 px-3 py-3 rounded-2xl border border-transparent hover:border-brand-200 hover:bg-white cursor-grab active:cursor-grabbing transition-all group shadow-sm hover:shadow-md select-none bg-white/40"
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                            style={{ backgroundColor: `${s.color}10`, border: `1.5px solid ${s.color}20` }}
                        >
                            <s.icon className="w-4 h-4" style={{ color: s.color }} />
                        </div>
                        <div className="hidden lg:block min-w-0">
                            <p className="text-xs font-black text-surface-900 leading-none mb-1">{s.label}</p>
                            <p className="text-[10px] font-medium text-surface-400 truncate">{s.desc}</p>
                        </div>
                        <GripVertical className="w-3 h-3 text-surface-200 ml-auto hidden lg:block group-hover:text-brand-400 transition-colors" />
                    </div>
                ))}
            </div>

            <div className="mt-auto p-6 border-t border-surface-200/40 bg-surface-100/50">
                <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-surface-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-surface-400 leading-relaxed uppercase tracking-wider">
                        Drag to Sandbox<br />
                        [DEL] to Scrub<br />
                        [SHIFT] Multi-Select
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Logic Canvas ─── */
const defaultNodes: Node[] = [
    {
        id: 'init-0',
        type: 'terminal',
        data: { label: 'START_PROCESS' },
        position: { x: 400, y: 100 },
    },
];

function FlowchartCanvas({ questionId }: { questionId: number }) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

    const onConnect = useCallback(
        (params: Connection | Edge) =>
            setEdges(eds =>
                addEdge(
                    {
                        ...params,
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#0d9488', width: 22, height: 22 },
                        style: { stroke: '#0d9488', strokeWidth: 2.5 },
                        animated: true,
                    },
                    eds
                )
            ),
        [setEdges]
    );

    const onDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('application/reactflow-type');
            const label = e.dataTransfer.getData('application/reactflow-label');
            if (!type) return;
            const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            setNodes(nds => nds.concat({
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: label || 'New Logic' },
            }));
        },
        [screenToFlowPosition, setNodes]
    );

    const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
        setSelectedNodes(nodes.map(n => n.id));
    }, []);

    const deleteSelected = () => {
        setNodes(ns => ns.filter(n => !selectedNodes.includes(n.id)));
        setEdges(es => es.filter(e => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)));
        setSelectedNodes([]);
    };

    const clearAll = () => {
        if (!confirm('Purge all logic nodes from the current sandbox?')) return;
        setNodes([{
            id: 'init-0', type: 'terminal',
            data: { label: 'REBOOT_START' }, position: { x: 400, y: 100 },
        }]);
        setEdges([]);
    };

    return (
        <div className="flex flex-1 overflow-hidden">
            <ShapePalette />

            <div className="flex-1 flex flex-col min-w-0 bg-surface-50">
                {/* Modern Contextual Toolbar */}
                <div className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-surface-200 shrink-0 z-10 shadow-sm">
                    <div className="flex items-center gap-2 mr-4">
                        <Zap className="w-4 h-4 text-brand-500 fill-brand-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-900">Sandbox Logic Beta</span>
                    </div>

                    <div className="h-6 w-px bg-surface-200 mx-2" />

                    <button
                        onClick={deleteSelected}
                        disabled={selectedNodes.length === 0}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-surface-200 bg-white text-surface-400 hover:text-red-600 hover:border-red-200 disabled:opacity-30 transition-all hover:shadow-md active:scale-95"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> <span>Scrub Selection</span>
                    </button>

                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-surface-200 bg-white text-surface-400 hover:text-brand-600 hover:border-brand-200 transition-all hover:shadow-md active:scale-95"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> <span>Reset Field</span>
                    </button>

                    <div className="ml-auto hidden sm:flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <p className="text-[9px] font-bold text-surface-400 uppercase tracking-tighter">Compiled Entropy</p>
                            <p className="text-xs font-black text-surface-900 tabular-nums leading-none">
                                {nodes.length} Nodes & {edges.length} Links
                            </p>
                        </div>
                    </div>
                </div>

                {/* Canvas Subsurface */}
                <div ref={reactFlowWrapper} className="flex-1 relative group">
                    <ReactFlow
                        key={questionId}
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onSelectionChange={onSelectionChange}
                        nodeTypes={nodeTypes}
                        fitView
                        deleteKeyCode="Delete"
                        selectionKeyCode="Shift"
                        multiSelectionKeyCode="Shift"
                        snapToGrid
                        snapGrid={[15, 15]}
                        defaultEdgeOptions={{
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#0d9488', width: 22, height: 22 },
                            style: { stroke: '#0d9488', strokeWidth: 2.5 },
                        }}
                    >
                        <Background variant={BackgroundVariant.Dots} color="#cbd5e1" gap={24} size={1} />
                        <Controls
                            showInteractive={false}
                            className="!left-4 !bottom-4 !flex !flex-row !bg-white/80 !backdrop-blur-md !border-surface-200 !rounded-2xl !shadow-xl !p-1 !gap-1"
                        />
                        <MiniMap
                            nodeStrokeColor="#0d9488"
                            nodeColor="#f0fdfa"
                            maskColor="rgba(248,250,252,0.9)"
                            className="!right-4 !bottom-4 !w-32 !h-20 !rounded-2xl !border-surface-200 !shadow-2xl"
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}

/* ─── Exported Component Provider ─── */
export default function FlowchartEditor({ questionId }: { questionId: number }) {
    return (
        <div className="flex flex-col h-full antialiased font-sans">
            <ReactFlowProvider>
                <FlowchartCanvas questionId={questionId} />
            </ReactFlowProvider>

            <style jsx global>{`
                /* ── Premium Logic Nodes ── */
                .fc-node-wrapper {
                    padding: 4px;
                    border-radius: 16px;
                    transition: all 0.3s;
                }

                .fc-node {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 14px 18px;
                    min-width: 140px;
                    border-radius: 14px;
                    border-width: 2.5px;
                    border-style: solid;
                    background: #ffffff;
                    color: #0f172a;
                    transition: all 0.25s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .fc-node:hover {
                    transform: scale(1.03);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                }

                /* Process — teal/brand */
                .fc-process {
                    border-color: #14b8a6;
                    background: #f0fdfa;
                    color: #134e4a;
                }

                /* Decision — sky blue */
                .fc-decision {
                    width: 120px;
                    height: 120px;
                    transform: rotate(45deg);
                    border-color: #0ea5e9;
                    background: #f0f9ff;
                    padding: 0;
                }
                .fc-diamond-inner {
                    transform: rotate(-45deg);
                    padding: 8px;
                    text-align: center;
                    width: 100%;
                    color: #0c4a6e;
                }

                /* Terminal — green */
                .fc-terminal {
                    border-radius: 9999px;
                    padding: 12px 28px;
                    border-color: #22c55e;
                    background: #f0fdf4;
                    color: #14532d;
                }

                /* IO — amber/orange */
                .fc-io {
                    transform: skewX(-15deg);
                    border-color: #f59e0b;
                    background: #fffbeb;
                    color: #78350f;
                }
                .fc-io > span, .fc-io > input {
                    display: inline-block;
                    transform: skewX(15deg);
                }

                /* Connector — purple */
                .fc-connector {
                    width: 80px;
                    height: 80px;
                    border-radius: 9999px;
                    border-color: #a855f7;
                    background: #faf5ff;
                    color: #581c87;
                    min-width: 0;
                    padding: 8px;
                }

                /* Text Annotation — dashed amber */
                .fc-text {
                    background: #fefce8;
                    border-width: 2px;
                    border-style: dashed;
                    border-color: #d97706;
                    border-radius: 10px;
                    padding: 8px 14px;
                    min-width: 0;
                    font-style: italic;
                    color: #92400e;
                }

                /* ── Connection Handles ── */
                .react-flow__handle {
                    width: 12px !important;
                    height: 12px !important;
                    border: 2px solid #fff !important;
                    box-shadow: 0 0 0 2px currentColor, 0 1px 4px rgba(0,0,0,0.15);
                    transition: all 0.2s;
                }
                .react-flow__handle:hover {
                    width: 18px !important;
                    height: 18px !important;
                }

                /* ── Selection Aesthetics ── */
                .react-flow__node.selected .fc-node {
                    box-shadow: 0 0 0 3px rgba(20,184,166,0.4), 0 8px 24px rgba(0,0,0,0.15);
                    transform: scale(1.05);
                }

                .react-flow__edge-path {
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.12));
                }

                .react-flow__attribution { display: none !important; }
            `}</style>
        </div>
    );
}
