/**
 * Tết Việt Nam overlay - Simple lanterns only
 * Clean decoration without animations
 */

export default function TetDecoration() {
  return (
    <div className="tet-decor" aria-hidden="true">
      {/* Lanterns - adjusted position for sidebar */}
      <div className="tet-lantern-group tet-lantern-left">
        <div className="tet-lantern" />
        <div className="tet-lantern" />
      </div>
      <div className="tet-lantern-group tet-lantern-right">
        <div className="tet-lantern" />
        <div className="tet-lantern" />
      </div>
    </div>
  );
}
