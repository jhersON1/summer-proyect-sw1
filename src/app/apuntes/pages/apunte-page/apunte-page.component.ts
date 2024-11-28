import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-apunte-page',
  templateUrl: './apunte-page.component.html',
  styleUrl: './apunte-page.component.scss'
})
export class ApuntePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private editorService = inject(EditorService);

  async ngOnInit() {
    console.log('[ApuntePageComponent] Initializing...');

    // Verificar sessionId en la URL
    this.route.queryParams.subscribe(async params => {
      const sessionId = params['sessionId'];
      if (sessionId) {
        console.log('[ApuntePageComponent] Session ID found:', sessionId);
        try {
          await this.editorService.joinSession(sessionId);
          console.log('[ApuntePageComponent] Joined collaborative session');
        } catch (error) {
          console.error('[ApuntePageComponent] Error joining session:', error);
        }
      } else {
        console.log('[ApuntePageComponent] No session ID in URL');
      }
    });
  }

}
