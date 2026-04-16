import {
  Atom,
  FileCode2,
  Box,
  Network,
  Container,
  BrainCircuit,
} from "lucide-react";

export const getIconForSkill = (name) => {
  const iconMap = {
    React: <Atom className="w-4 h-4" />,
    TypeScript: <FileCode2 className="w-4 h-4" />,
    "Node.js": <Box className="w-4 h-4" />,
    GraphQL: <Network className="w-4 h-4" />,
    Docker: <Container className="w-4 h-4" />,
    JavaScript: <FileCode2 className="w-4 h-4" />,
  };
  return iconMap[name] || <BrainCircuit className="w-4 h-4" />;
};
