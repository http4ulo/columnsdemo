import { Flex, Heading, Text } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";

const Column = dynamic(() => import("../src/Column"), { ssr: false });

const reorderTasks = (columns, source, destination) => {

  const sourceColumn = columns[source.droppableId];
  const destinationColumn = columns[destination.droppableId];
  const sourceTasks = [...sourceColumn.taskIds];
  const destinationTasks = [...destinationColumn.taskIds];

  // Remove a tarefa da origem e coloca na destinação
  const [removedTask] = sourceTasks.splice(source.index, 1);
  destinationTasks.splice(destination.index, 0, removedTask);

  // Verifica se a coluna destino ultrapassou o limite de tarefas
  if (destinationTasks.length > 5) {
    // Move a tarefa para a próxima coluna
    const nextColumnId = getNextColumnId(columns, destinationColumn.id);
    const nextColumn = columns[nextColumnId];
    const nextTasks = [...nextColumn.taskIds];
    nextTasks.splice(0, 0, removedTask);

    return {
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        taskIds: sourceTasks,
      },
      [destination.droppableId]: {
        ...destinationColumn,
        taskIds: destinationTasks,
      },
      [nextColumnId]: {
        ...nextColumn,
        taskIds: nextTasks,
      },
    };
  }

  return {
    ...columns,
    [source.droppableId]: {
      ...sourceColumn,
      taskIds: sourceTasks,
    },
    [destination.droppableId]: {
      ...destinationColumn,
      taskIds: destinationTasks,
    },
  };
};

const getNextColumnId = (columns, columnId) => {
  const columnIds = Object.keys(columns);
  const currentIndex = columnIds.indexOf(columnId);
  const nextIndex = currentIndex + 1;

  if (nextIndex === columnIds.length) {
    return columnIds[0];
  }

  return columnIds[nextIndex];
};

const reorderColumnList = (sourceCol, startIndex, endIndex) => {
  const newTaskIds = Array.from(sourceCol.taskIds);
  const [removed] = newTaskIds.splice(startIndex, 1);

  if (newTaskIds.length >= 4 && endIndex >= 4) {
    return sourceCol;
  }

  newTaskIds.splice(endIndex, 0, removed);

  const newColumn = {
    ...sourceCol,
    taskIds: newTaskIds,
  };

  return newColumn;
};

export default function Home() {
  const [state, setState] = useState(initialData);

  const onDragEnd = (result) => {
    const { destination, source } = result;
    console.log("destination", destination, source)
    console.log("source", source)
    if (!destination) return;

    // if the user drags and drops back in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If the user drops within the same column but in a different positoin
    const sourceCol = state.columns[source.droppableId];
    const destinationCol = state.columns[destination.droppableId];

    if (sourceCol.id === destinationCol.id) {
      const newColumn = reorderColumnList(
        sourceCol,
        source.index,
        destination.index
      );

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      };
      setState(newState);
      return;
    }

    // If the user moves from one column to another
    const startTaskIds = Array.from(sourceCol.taskIds);
    const [removed] = startTaskIds.splice(source.index, 1);
    const newStartCol = {
      ...sourceCol,
      taskIds: startTaskIds,
    };

    const endTaskIds = Array.from(destinationCol.taskIds);
    endTaskIds.splice(destination.index, 0, removed);
    const newEndCol = {
      ...destinationCol,
      taskIds: endTaskIds,
    };

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol,
      },
    };

    if (newEndCol.taskIds.length > 4) {
      console.log(newState)
      setState(reorderTasks(newState));
      return;
    }
    setState(newState);
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Flex
        flexDir="column"
        bg="main-bg"
        minH="100vh"
        w="full"
        color="white-text"
        pb="2rem"
      >
        <Flex py="4rem" flexDir="column" align="center">
          <Heading fontSize="3xl" fontWeight={600}>
            Mosaico
          </Heading>
          <Text fontSize="20px" fontWeight={600} color="subtle-text">
            Teste drag and drop
          </Text>
        </Flex>

        <Flex justify="space-between" px="4rem">
          {state.columnOrder.map((columnId) => {
            const column = state.columns[columnId];
            const tasks = column.taskIds
              .slice(0, 5)
              .map((taskId) => state.tasks[taskId]);

            return <Column key={column.id} column={column} tasks={tasks} />;
          })}
        </Flex>
      </Flex>
    </DragDropContext>
  );
}

const initialData = {
  tasks: {
    1: { id: 1, content: "Video 1", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    2: { id: 2, content: "Video 2", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    3: { id: 3, content: "Video 3", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    4: { id: 4, content: "Video 4", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    5: { id: 5, content: "Video 5", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    6: { id: 6, content: "Video 6", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    7: { id: 7, content: "Video 7", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    8: { id: 8, content: "Video 8", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    9: { id: 9, content: "Video 9", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    10: { id: 10, content: "Video 10", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    11: { id: 11, content: "Video 11", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    12: { id: 12, content: "Video 12", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    13: { id: 13, content: "Video 13", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    14: { id: 14, content: "Video 14", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    15: { id: 15, content: "Video 15", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    16: { id: 16, content: "Video 16", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    17: { id: 17, content: "Video 17", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    18: { id: 18, content: "Video 18", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    19: { id: 19, content: "Video 19", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    20: { id: 20, content: "Video 20", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    21: { id: 21, content: "Video 21", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    22: { id: 22, content: "Video 22", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    23: { id: 23, content: "Video 23", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    24: { id: 24, content: "Video 24", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    25: { id: 25, content: "Video 25", src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
  },
  columns: {
    1: {
      id: 1,
      title: "SIDEBAR",
      taskIds: [1, 2, 3, 4, 5],
    },
    2: {
      id: 2,
      title: "1",
      taskIds: [6, 7, 8, 9, 10],
    },
    3: {
      id: 3,
      title: "2",
      taskIds: [13, 14, 15, 16, 17, 18],
    },
    4: {
      id: 4,
      title: "3",
      taskIds: [19, 20, 21, 22, 23, 24],
    },
    5: {
      id: 5,
      title: "4",
      taskIds: [25],
    },
  },
  // Facilitate reordering of the columns
  columnOrder: [1, 2, 3, 4, 5],
};
