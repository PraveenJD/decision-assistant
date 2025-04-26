const MindMapTab = () => {
  return (
    <div className="flex-1 flex flex-col gap-3 overflow-auto p-3 bg-gray-100">
      <div className="h-3/4 bg-white border border-gray-200 rounded p-3">
        <h6 className="font-semibold">Mind Map: Clinical Trial XYZ-123</h6>
      </div>
      <div className="bg-white border border-gray-200 rounded p-3">
        <h6 className="font-semibold">Selected Node:</h6>
      </div>
    </div>
  );
};

export default MindMapTab;
