import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import type { ProjectDetail } from "../queries";
import { assignEquipmentAction, unassignEquipmentAction } from "../../equipment-actions";
import type { EquipmentModel } from "@/generated/prisma/models";

export function EquipmentTab({
  project,
  unassignedEquipment,
  canManage,
}: {
  project: ProjectDetail;
  unassignedEquipment: EquipmentModel[];
  canManage: boolean;
}) {
  return (
    <div className="space-y-4">
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>Assign equipment</CardTitle>
          </CardHeader>
          <CardContent>
            {unassignedEquipment.length === 0 ? (
              <p className="text-sm text-muted">
                No unassigned equipment available. Add equipment from the Equipment page.
              </p>
            ) : (
              <form
                action={assignEquipmentAction.bind(null, project.id)}
                className="flex flex-wrap items-end gap-3"
              >
                <div className="min-w-56">
                  <Select id="equipmentId" name="equipmentId" required defaultValue="">
                    <option value="" disabled>
                      Select equipment
                    </option>
                    {unassignedEquipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <SubmitButton>Assign to project</SubmitButton>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {project.equipment.length === 0 ? (
        <EmptyState title="No equipment assigned to this project" />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Type</TH>
              <TH>Serial #</TH>
              <TH>Status</TH>
              {canManage && <TH />}
            </TR>
          </THead>
          <TBody>
            {project.equipment.map((eq) => (
              <TR key={eq.id}>
                <TD className="font-medium text-foreground">{eq.name}</TD>
                <TD className="text-muted">{eq.type || "—"}</TD>
                <TD className="text-muted">{eq.serialNumber || "—"}</TD>
                <TD>
                  <StatusBadge status={eq.status} />
                </TD>
                {canManage && (
                  <TD>
                    <form action={unassignEquipmentAction.bind(null, project.id, eq.id)}>
                      <Button type="submit" size="sm" variant="secondary">
                        Unassign
                      </Button>
                    </form>
                  </TD>
                )}
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
