import {Component, forwardRef, Injector, Input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl, FormControlDirective,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl, ValidationErrors
} from "@angular/forms";
import {MatButton, MatFabButton, MatMiniFabButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'app-reactive-file-input',
  standalone: true,
  imports: [
    MatIcon,
    MatMiniFabButton,
    NgIf,
    MatButton,
    MatFabButton,
    MatDivider
  ],
  templateUrl: './reactive-file-input.component.html',
  styleUrl: './reactive-file-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReactiveFileInputComponent),
      multi: true
    }
  ]
})
export class ReactiveFileInputComponent implements ControlValueAccessor{
  @Input({required: true}) labelText!: string;
  @Input() allowedFileTypes: String[] = [];

  protected fileTypeViolate?: {value: any};

  @Input() maxFileSize?: number;

  protected fileSizeViolate?: {value: any}
  private formControl?: FormControl;
  protected _onChangeFn?: (value:any) => {};
  protected _onTouchFn?: (value:any) => {};
  protected isDisabled: boolean = false;
  value: File | null = null;

  constructor(private injector: Injector) {}

  ngOnInit() {
    let injectedControl = this.injector.get(NgControl, undefined,  {optional: true})
    if (injectedControl instanceof FormControlName) {
      this.formControl = this.injector.get(FormGroupDirective).getControl(injectedControl);
    } else if (injectedControl instanceof FormControlDirective) {
      this.formControl = injectedControl.form;
    }

    if (this.formControl) {
      this.formControl.addValidators((control: AbstractControl<File, any>): ValidationErrors | null => {
        if (!this.maxFileSize || control.value === null || control.value.size <= this.maxFileSize * 1048576) {
          return null
        }
        return {forbiddenFileSize: {value: control.value.size}}
      })
      if (this.allowedFileTypes.length > 0) {
        this.formControl.addValidators((control: AbstractControl<File, any>): ValidationErrors | null => {
          if (control.value === null || this.allowedFileTypes.includes(control.value.type)) {
            return null
          }
          return {forbiddenMIMEType: {value: control.value.type}}
        })
      }
    }
  }

  onFileSelected($event: Event) {
    if ($event.target instanceof HTMLInputElement) {
      if ($event.target.files !== null && $event.target.files.length > 0) {
        this.internalSetValue($event.target.files.item(0))
      }
    }
  }

  internalSetValue(file: File | null) {
    this.writeValue(file)
    if (this.formControl && this.formControl?.validator !== null) {
      if (this._onChangeFn) {
        this._onChangeFn(this.value)
      }
      let validationResult = this.formControl.validator(this.formControl)
      if (validationResult !== null) {
        this.fileSizeViolate = validationResult['forbiddenFileSize']
        this.fileTypeViolate = validationResult['forbiddenMIMEType']
      } else {
        this.fileSizeViolate = undefined;
        this.fileTypeViolate = undefined;
      }
    }
  }

  registerOnChange(fn: (value:any) => {}): void {
    this._onChangeFn = fn
  }

  registerOnTouched(fn: (value:any) => {}): void {
    this._onTouchFn = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (obj instanceof File || obj === null) {
      this.value = obj
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault()
    if (event.target instanceof HTMLElement && event.dataTransfer !== null) {
      if (event.dataTransfer.items instanceof DataTransferItemList) {
        let filteredItems = Array.from(event.dataTransfer.items)
          .filter((item) => item.kind === 'file')
        if (filteredItems.length > 0) {
          this.internalSetValue(filteredItems[0].getAsFile())
        }
      }
    }
  }

  protected readonly ondragover = ondragover;

  onDragover(event: DragEvent) {
    event.preventDefault()
  }
}
