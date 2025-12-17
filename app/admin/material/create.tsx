import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  ReferenceInput,
  required,
} from "react-admin";
import { RichTextInput } from "ra-input-rich-text";

export const MaterialCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="title" label="Judul Materi" validate={required()} />

        <ReferenceInput source="unitId" reference="units" />

        <NumberInput source="order" validate={required()} />

        <RichTextInput source="content" label="Isi Materi" fullWidth />
      </SimpleForm>
    </Create>
  );
};
