import { useCallback, useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, addEdge, Connection, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Upload, Sparkles, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomNode } from '@/components/CustomNode';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import mammoth from 'mammoth/mammoth.browser';
const nodeTypes = {
  custom: CustomNode,
};

const colorPalette = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#06b6d4', // cyan
];

export default function Thoughtscape() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const content = localStorage.getItem('learning-content');
    if (content) {
      setInputText(content);
    }
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const generateMindMap = async () => {
    if (!inputText.trim()) {
      toast({
        title: 'No content provided',
        description: 'Please enter some text or upload a file first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-learning', {
        body: { content: inputText, type: 'all' },
      });

      if (error) throw error;

      // Generate nodes and edges from concepts
      const concepts = data.concepts || [];
      
      if (concepts.length === 0) {
        toast({
          title: 'No concepts found',
          description: 'Could not extract concepts from the content.',
          variant: 'destructive',
        });
        setIsGenerating(false);
        return;
      }

      // Create a hierarchical structure
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      const handleNodeOpen = (nodeData: any) => {
        setSelectedNode(nodeData);
      };

      // Main topic node at the top
      const mainTopic = concepts[0];
      newNodes.push({
        id: '0',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: {
          label: mainTopic,
          description: 'Central concept from your input',
          badge: 'Core',
          color: colorPalette[0],
          details: `Main topic: ${mainTopic}. This is the central theme extracted from your study material.`,
          onOpen: handleNodeOpen,
        },
      });

      // Layout remaining concepts in layers
      const remainingConcepts = concepts.slice(1);
      const layer1Count = Math.min(3, remainingConcepts.length);
      const layer2Start = layer1Count;

      // Layer 1 - Direct children
      for (let i = 0; i < layer1Count; i++) {
        const nodeId = `${i + 1}`;
        const x = 200 + (i * 300);
        const y = 200;
        
        newNodes.push({
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: remainingConcepts[i],
            description: `Key concept derived from ${mainTopic}`,
            badge: 'Category',
            color: colorPalette[(i + 1) % colorPalette.length],
            details: `This is a major branch of ${mainTopic}. It represents an important subcategory to explore further.`,
            onOpen: handleNodeOpen,
          },
        });

        newEdges.push({
          id: `e0-${nodeId}`,
          source: '0',
          target: nodeId,
          animated: true,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        });
      }

      // Layer 2 - Sub-concepts
      const layer2Concepts = remainingConcepts.slice(layer2Start);
      layer2Concepts.forEach((concept, i) => {
        const nodeId = `${layer2Start + i + 1}`;
        const parentIndex = i % layer1Count;
        const parentId = `${parentIndex + 1}`;
        const x = 150 + (parentIndex * 300) + ((i / layer1Count) * 150);
        const y = 350;

        newNodes.push({
          id: nodeId,
          type: 'custom',
          position: { x, y },
          data: {
            label: concept,
            description: 'Detail',
            badge: 'Subconcept',
            color: colorPalette[(layer2Start + i + 2) % colorPalette.length],
          },
        });

        newEdges.push({
          id: `e${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          animated: false,
          style: { stroke: '#94a3b8', strokeDasharray: '5,5' },
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);

      toast({
        title: 'Mind map generated!',
        description: `Created ${newNodes.length} concept nodes`,
      });
    } catch (error) {
      console.error('Error generating mind map:', error);
      toast({
        title: 'Generation failed',
        description: 'Could not generate mind map. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
        toast({
          title: 'File uploaded',
          description: `Loaded ${file.name}`,
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'Could not read .docx file',
          variant: 'destructive',
        });
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
        toast({
          title: 'File uploaded',
          description: `Loaded ${file.name}`,
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
      <div className="container mx-auto py-6 px-4">
        <h1 className="pixel-font text-4xl mb-6 text-center text-foreground">Thoughtscape</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
          {/* Input Panel */}
          <Card className="p-6 glass-card flex flex-col gap-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-bold">Input Zone</h2>
            </div>
            
            <Textarea
              placeholder="Paste your study material or notes here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 resize-none"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.md,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <Button
              onClick={generateMindMap}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Generate Mind Map'}
            </Button>

            <div className="text-xs text-muted-foreground mt-2">
              <p>💡 Tip: The AI will extract key concepts and create an interactive flowchart to help you visualize connections.</p>
            </div>
          </Card>

          {/* React Flow Canvas */}
          <Card className="lg:col-span-3 p-2 glass-card overflow-hidden">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-background/50 rounded-lg"
            >
              <Background className="dark:bg-background/10" />
              <Controls className="!bg-card !border-border !shadow-lg [&_button]:!bg-card [&_button]:!border-border [&_button]:!text-foreground hover:[&_button]:!bg-accent" />
              <MiniMap 
                nodeColor={(node) => {
                  const data = node.data as { color?: string };
                  return data.color || '#6366f1';
                }}
                className="!bg-card/80 !border !border-border"
              />
            </ReactFlow>
          </Card>
        </div>
      </div>

      {/* Node Details Dialog */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: selectedNode?.color || '#6366f1' }}
              />
              {selectedNode?.label}
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedNode?.badge && (
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium mb-3">
                  {selectedNode.badge}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedNode?.description && (
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Overview</h4>
                <p className="text-muted-foreground">{selectedNode.description}</p>
              </div>
            )}
            {selectedNode?.details && (
              <div>
                <h4 className="font-semibold mb-2 text-foreground">Details</h4>
                <p className="text-muted-foreground leading-relaxed">{selectedNode.details}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
