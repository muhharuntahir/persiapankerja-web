import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  required,
} from "react-admin";

import { RichTextInput } from "ra-input-rich-text";

export const MaterialEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        {/* Judul */}
        <TextInput
          source="title"
          label="Judul Materi"
          validate={[required()]}
          fullWidth
        />

        {/* Relasi ke Unit */}
        <ReferenceInput source="unitId" reference="units" label="Unit" />

        {/* Urutan */}
        <NumberInput
          source="order"
          label="Urutan Materi"
          validate={[required()]}
        />

        {/* KONTEN UTAMA */}
        <RichTextInput source="content" label="Isi Materi" fullWidth />
      </SimpleForm>
    </Edit>
  );
};
