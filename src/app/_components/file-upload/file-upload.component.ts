import {ChangeDetectorRef, Component} from '@angular/core';
import {MatFormField, MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ReactiveFileInputComponent} from "../reactive-file-input/reactive-file-input.component";
import {GraphDataService} from "../../_services/graph-data.service";
import {mergeMap, Observable, of, zip} from "rxjs";
import {MatIcon} from "@angular/material/icon";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    MatInput,
    MatButton,
    NgIf,
    MatFormField,
    ReactiveFormsModule,
    ReactiveFileInputComponent,
    ReactiveFileInputComponent,
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  protected formGroup: FormGroup = new FormGroup({
    pdf: new FormControl(null, [Validators.required]),
    processing: new FormControl(null),
    fileNameOverride: new FormControl('', [Validators.pattern(/^[a-zA-Z0-9_\- ]*$/)])
  })
  protected success: boolean | null = null;

  constructor(private graphDataService: GraphDataService, private snackbar: MatSnackBar) {
  }

  submitForm($event: any) {
    if (this.formGroup.valid) {
      this.success = null;
      let pdfFile: File = this.formGroup.controls['pdf'].value
      let processingFile: File | null = this.formGroup.controls['processing'].value
      let fileNameOverride = this.formGroup.controls['fileNameOverride'].value;
      if (fileNameOverride !== '') {
        pdfFile = new File([pdfFile], `${fileNameOverride}.pdf`)
        if (processingFile !== null) {
          processingFile = new File([processingFile], `${fileNameOverride}.xml`)
        }
      }
      let fileUploads = [this.graphDataService.uploadPdfFile(pdfFile)]
      if (processingFile !== null) {
        fileUploads.push(this.graphDataService.uploadProcessingFile(processingFile))
      }

      zip(fileUploads).pipe(
        mergeMap((uploadResults): Observable<any> => {
          return this.graphDataService.createDocFile(uploadResults[0].fid[0].value, uploadResults[1]?.fid[0].value ?? null)
        })
      ).subscribe({
        next: (value) => this.success = true,
        error: (error) => this.success = false,
      })
    }
  }
}
