import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  standalone: true,
  imports: [
    RouterLink
  ],
  styleUrls: ['./setting.component.css']
})
export class SettingComponent {
  setTheme(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedTheme = selectElement.value;
    console.log('Theme selected:', selectedTheme);

  }

  setLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLanguage = selectElement.value;
    console.log('Language selected:', selectedLanguage);

  }
}
