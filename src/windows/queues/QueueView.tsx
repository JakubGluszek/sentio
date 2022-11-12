import React from "react";
import { MdAddCircle, MdDelete, MdPlayCircle } from "react-icons/md";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { arrayMoveImmutable } from "array-move";
import { appWindow } from "@tauri-apps/api/window";

import { Queue } from "../../bindings/Queue";
import { QueueSession } from "../../bindings/QueueSession";
import useGlobal from "../../store";
import CreateSessionView from "./CreateSessionView";
import { ipc_invoke } from "../../ipc";
import { ModelDeleteResultData } from "../../bindings/ModelDeleteResultData";
import { ActiveQueue } from "../../bindings/ActiveQueue";

interface Props {
  data: Queue;
}

const QueueView: React.FC<Props> = ({ data }) => {
  const [viewCreateSession, setViewCreateSession] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const updateQueue = useGlobal((state) => state.updateQueue);
  const removeQueue = useGlobal((state) => state.removeQueue);

  const startQueue = () => {
    ipc_invoke<ActiveQueue>("set_active_queue", {
      data: {
        ...data,
        iterations: 1,
        session_idx: 0,
        session_cycle: 1,
      },
    }).catch((err) => console.log(err));

    appWindow.close();
  };

  const saveSession = (session: QueueSession) => {
    ipc_invoke<Queue>("update_queue", {
      id: data.id,
      data: { ...data, sessions: [...data.sessions, session] },
    })
      .then((res) => updateQueue(res.data))
      .catch((err) => console.log(err));
  };

  /** Delete the current queue */
  const remove = () => {
    ipc_invoke<ModelDeleteResultData>("delete_queue", { id: data.id })
      .then((res) => removeQueue(res.data.id))
      .catch((err) => console.log(err));
  };

  const removeSession = (id: string) => {
    ipc_invoke<Queue>("update_queue", {
      id: data.id,
      data: { ...data, sessions: data.sessions.filter((s) => s.id !== id) },
    })
      .then((res) => updateQueue(res.data))
      .catch((err) => console.log(err));
  };

  const triggerConfirmDelete = () => {
    setConfirmDelete(true);
    setTimeout(() => {
      setConfirmDelete(false);
    }, 1600);
  };

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const sessions = arrayMoveImmutable(
      data.sessions,
      result.source.index,
      result.destination.index
    );

    ipc_invoke<Queue>("update_queue", {
      id: data.id,
      data: { ...data, sessions },
    })
      .then((res) => updateQueue(res.data))
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex flex-col gap-2 rounded bg-base p-2">
      <div className="flex flex-row items-center justify-between">
        <span className="text-xl">{data.name}</span>
        <div className="flex flex-row items-center gap-2">
          <button className="btn btn-ghost" onClick={() => startQueue()}>
            <MdPlayCircle size={32} />
          </button>
          <button
            className={`btn ${
              confirmDelete ? "btn-primary p-0.5 px-1 gap-1" : "btn-ghost"
            }`}
            onClick={() => (confirmDelete ? remove() : triggerConfirmDelete())}
          >
            <MdDelete size={32} />
            {confirmDelete && <span>Confirm</span>}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {!viewCreateSession ? (
          <button
            className="btn btn-primary"
            onClick={() => setViewCreateSession(true)}
          >
            <MdAddCircle size={24} />
            <span>Add a session</span>
          </button>
        ) : (
          <CreateSessionView
            hide={() => setViewCreateSession(false)}
            save={(session: QueueSession) => {
              saveSession(session);
              setViewCreateSession(false);
            }}
          />
        )}
        {/* Sessions */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-col gap-2"
              >
                {data.sessions.map((session, index) => (
                  <Draggable
                    key={session.id}
                    draggableId={session.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <SessionView
                        key={session.id}
                        data={session}
                        remove={() => removeSession(session.id)}
                        snapshot={snapshot}
                        innerRef={provided.innerRef}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    )}
                  </Draggable>
                ))}
                {data.sessions.length === 0 && (
                  <span className="text-center p-2">No sessions</span>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

interface SessionViewProps {
  data: QueueSession;
  remove: () => void;
  snapshot: DraggableStateSnapshot;
  innerRef: (element?: HTMLElement | null | undefined) => any;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | undefined;
}

const SessionView: React.FC<SessionViewProps> = ({
  data,
  remove,
  snapshot,
  innerRef,
  draggableProps,
  dragHandleProps,
}) => {
  const getProjectById = useGlobal((state) => state.getProjectById);

  return (
    <div
      id={data.id}
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={`relative group flex flex-row gap-2 text-center rounded bg-window p-2 ${
        snapshot.isDragging ? "shadow-xl" : "shadow-none"
      }`}
    >
      <div className="flex-1 items-center justify-center">
        {getProjectById(data.project_id)?.name ?? "None"}
      </div>
      <div className="flex-1 items-center justify-center">
        {data.duration} min
      </div>
      <div className="flex-1 items-center justify-center">{data.cycles}x</div>
      <button
        className="absolute top-0.5 right-2 transition-opacity opacity-0 group-hover:opacity-100 btn btn-ghost"
        onClick={() => remove()}
      >
        <MdDelete size={24} />
      </button>
    </div>
  );
};

export default QueueView;