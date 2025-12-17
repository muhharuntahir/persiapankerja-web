import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  NumberField,
} from "react-admin";

export const MaterialList = () => {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="title" label="Judul Materi" />

        {/* Relasi ke Unit */}
        <ReferenceField source="unitId" reference="units" label="Unit">
          <TextField source="title" />
        </ReferenceField>

        <NumberField source="order" label="Urutan" />
      </Datagrid>
    </List>
  );
};
