import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import {
  getTopicDetails,
  getTopicQuestions,
  buildKnowledgeGraph,
  findOptimalLearningPath,
} from "../lib/api";
import { Topic, Question, KnowledgeGraph } from "../types";
import Link from "next/link";
import {
  FiArrowLeft,
  FiBookOpen,
  FiCheck,
  FiMap,
  FiBarChart2,
} from "react-icons/fi";
import dynamic from "next/dynamic";
import { Timestamp } from "firebase/firestore";

// Importación dinámica para evitar problemas SSR
const ForceGraph = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default),
  { ssr: false }
);

type GraphNode = {
  id?: string | number; // Make id optional to match library
  name?: string;
  val?: number;
  color?: string;
  difficulty?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  [key: string]: unknown; // Changed from any to unknown for better type safety
};
type GraphLink = {
  source: string | number | GraphNode;
  target: string | number | GraphNode;
  value?: number;
  color?: string;
  type?: string;
  [key: string]: unknown;
};

export default function LearnPath() {
  const router = useRouter();
  const { topics: topicsQuery } = router.query;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph | null>(
    null
  );
  const [learningPath, setLearningPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "graph" | "stats">("graph");
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!topicsQuery || !auth.currentUser) return;

    const loadData = async () => {
      try {
        const topicIds = (topicsQuery as string).split(",");
        const userId = auth.currentUser!.uid;

        const [topicDetails, graph] = await Promise.all([
          Promise.all(topicIds.map((id) => getTopicDetails(userId, id))),
          buildKnowledgeGraph(userId, topicIds),
        ]);

        const validTopics = topicDetails.filter((t): t is Topic => t !== null);
        setTopics(validTopics);
        setKnowledgeGraph(graph);

        // Preparar datos para el gráfico
        if (graph) {
          const nodes = graph.nodes.map((node) => ({
            id: node.id,
            name: node.name,
            val: topicIds.includes(node.id) ? 10 : 5, // Tamaño diferente para nodos principales
            color: topicIds.includes(node.id) ? "#3b82f6" : "#10b981",
            difficulty: node.difficulty,
          }));

          const links = graph.links.map((link) => ({
            source: link.source,
            target: link.target,
            value: link.weight,
            color: link.type === "fundamental" ? "#3b82f6" : "#10b981",
          }));

          setGraphData({ nodes, links });

          // Calcular camino de aprendizaje si hay temas
          if (validTopics.length > 0) {
            const path = findOptimalLearningPath(graph, validTopics[0].id);
            setLearningPath(path);
          }
        }

        // Cargar preguntas para cada tema
        const questionsData: Record<string, Question[]> = {};
        for (const topic of validTopics) {
          questionsData[topic.id] = await getTopicQuestions(userId, topic.id);
        }
        setQuestions(questionsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [topicsQuery]);

  const calculateTopicProgress = useCallback((topic: Topic): number => {
    if (!topic.correctAnswers || !topic.totalAnswers) return 0;
    const total = topic.totalAnswers.length;
    return total > 0
      ? Math.round((topic.correctAnswers.filter(Boolean).length / total) * 100)
      : 0;
  }, []);

  const getTopicStats = useCallback((topic: Topic) => {
    if (!topic.quizHistory) return { attempts: 0, bestScore: 0 };

    const attempts = topic.quizHistory.length;
    const bestScore = Math.max(...topic.quizHistory.map((q) => q.score), 0);

    return { attempts, bestScore };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors">
              <FiArrowLeft />
              Volver
            </button>
          </Link>
          <div className="bg-green-600 text-white p-2 rounded-lg">
            <FiBookOpen className="text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Ruta de Aprendizaje
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100"
            }`}
          >
            <FiBookOpen />
          </button>
          <button
            onClick={() => setViewMode("graph")}
            className={`p-2 rounded-lg ${
              viewMode === "graph" ? "bg-blue-100 text-blue-600" : "bg-gray-100"
            }`}
          >
            <FiMap />
          </button>
          <button
            onClick={() => setViewMode("stats")}
            className={`p-2 rounded-lg ${
              viewMode === "stats" ? "bg-blue-100 text-blue-600" : "bg-gray-100"
            }`}
          >
            <FiBarChart2 />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {viewMode === "list" ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Contenido de los Temas
            </h2>
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay temas seleccionados</p>
              </div>
            ) : (
              <div className="space-y-8">
                {topics.map((topic) => (
                  <div key={topic.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {topic.name}
                        </h3>
                        <p className="text-gray-600">{topic.description}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {calculateTopicProgress(topic)}% completado
                      </span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        Preguntas ({questions[topic.id]?.length || 0})
                      </h4>
                      {questions[topic.id]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {questions[topic.id].map((question) => (
                            <QuestionCard
                              key={`${topic.id}-${question.id}`}
                              question={question}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Este tema no tiene preguntas aún
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : viewMode === "graph" ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Mapa de Conocimiento
            </h2>

            {graphData ? (
              <div className="h-[600px] border rounded-lg overflow-hidden relative">
                <ForceGraph
                  graphData={graphData}
                  nodeLabel="name"
                  nodeAutoColorBy="color"
                  linkDirectionalArrowLength={6}
                  linkDirectionalArrowRelPos={1}
                  linkColor={(link) => (link.color as string) || "#999"}
                  linkWidth={(link) => ((link as GraphLink).value || 1) / 2}
                  nodeCanvasObject={(
                    node: GraphNode,
                    ctx: CanvasRenderingContext2D,
                    globalScale: number
                  ) => {
                    const label = node.name || String(node.id);
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle =
                      node.id === selectedNode ? "#ef4444" : "black";
                    ctx.fillText(label, node.x || 0, (node.y || 0) + 10);
                  }}
                  onNodeClick={(node: GraphNode | null) => {
                    if (node) {
                      setSelectedNode(
                        node.id === selectedNode ? null : String(node.id)
                      );
                    }
                  }}
                  onNodeHover={(node: GraphNode | null) => {
                    document.body.style.cursor = node ? "pointer" : "default";
                  }}
                />
                {selectedNode && (
                  <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md max-w-xs">
                    <h3 className="font-bold mb-2">
                      {graphData.nodes.find((n) => n.id === selectedNode)?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Dificultad:{" "}
                      {
                        graphData.nodes.find((n) => n.id === selectedNode)
                          ?.difficulty
                      }
                    </p>
                    {topics.some((t) => t.id === selectedNode) && (
                      <button
                        onClick={() =>
                          router.push(`/quiz?topicId=${selectedNode}`)
                        }
                        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Tomar Quiz
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center h-[600px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
              </div>
            )}

            {learningPath.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">
                  Camino de Aprendizaje Recomendado:
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {learningPath.map((topicId, index) => {
                    const topic = knowledgeGraph?.nodes.find(
                      (n) => n.id === topicId
                    );
                    return (
                      <div key={topicId} className="flex items-center gap-2">
                        {index > 0 && <span className="text-gray-400">→</span>}
                        <span
                          className={`px-3 py-1 rounded-full ${
                            index === 0
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {topic?.name || topicId}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Estadísticas de Aprendizaje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => {
                const stats = getTopicStats(topic);
                return (
                  <div
                    key={topic.id}
                    className="border p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-bold text-lg mb-2">{topic.name}</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-600">Progreso: </span>
                        <span className="font-medium">
                          {calculateTopicProgress(topic)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Intentos: </span>
                        <span className="font-medium">{stats.attempts}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mejor puntaje: </span>
                        <span className="font-medium">{stats.bestScore}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Último intento: </span>
                        <span className="font-medium">
                          {topic.lastPlayed
                            ? new Date(
                                topic.lastPlayed instanceof Timestamp
                                  ? topic.lastPlayed.toDate()
                                  : topic.lastPlayed
                              ).toLocaleDateString()
                            : "Nunca"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <div className="border p-4 rounded-lg hover:bg-white transition-colors">
      <p className="font-medium mb-2">{question.text}</p>
      <ul className="space-y-1">
        {question.options.map((option, optIndex) => (
          <li
            key={optIndex}
            className={`flex items-center gap-2 text-sm ${
              option === question.correctAnswer
                ? "text-green-600 font-medium"
                : "text-gray-600"
            }`}
          >
            <FiCheck
              className={
                option === question.correctAnswer ? "opacity-100" : "opacity-0"
              }
            />
            {option}
          </li>
        ))}
      </ul>
      {question.explanation && (
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-medium">Explicación:</span>{" "}
          {question.explanation}
        </p>
      )}
    </div>
  );
}
