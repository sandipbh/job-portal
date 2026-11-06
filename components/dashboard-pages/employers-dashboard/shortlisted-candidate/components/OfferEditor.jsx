'use client';

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Underline, Heading, Font, Alignment, List, Link, Table, BlockQuote, Undo } from "ckeditor5";
import "ckeditor5/ckeditor5.css";

const OfferEditor = ({ value = "", onChange }) => {
    return (
        <div className="offer-editor">
            <CKEditor
                editor={ClassicEditor}
                config={{
                    licenseKey: "GPL",
                    plugins: [Essentials, Paragraph, Bold, Italic, Underline, Heading, Font, Alignment, List, Link, Table, BlockQuote, Undo],
                    toolbar: [
                        "undo", "redo", "|", "heading", "|",
                        "bold", "italic", "underline", "|",
                        "fontSize", "fontFamily", "fontColor", "fontBackgroundColor", "|",
                        "alignment", "|", "bulletedList", "numberedList", "|",
                        "link", "insertTable", "blockQuote"
                    ],
                    initialData: value
                }}
                data={value}
                onChange={(event, editor) => {
                    onChange?.(editor.getData());
                }}
            />
        </div>
    );
};

export default OfferEditor;