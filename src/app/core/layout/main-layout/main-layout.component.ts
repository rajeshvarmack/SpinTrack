import { Component, signal, computed, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class MainLayoutComponent {
  private router = inject(Router);
  
  // Sidebar starts closed on mobile, open on desktop
  sidebarOpen = signal(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  isMobile = signal(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  adminExpanded = signal(false);
  hoveredMenu = signal<string | null>(null);
  currentRoute = signal(this.router.url);

  // Check if current route is under admin section
  isAdminRoute = computed(() => {
    const url = this.currentRoute();
    return url.includes('/users') || url.includes('/roles') || url.includes('/permissions') || 
           url.includes('/modules') || url.includes('/sub-modules');
  });

  // Only treat Admin as "active" when the explicit /admin route is navigated to.
  // This keeps submenu child-route detection (isAdminRoute) for expanding the menu,
  // but prevents the top-level Admin button from being highlighted when a submenu is active.
  isAdminActive = computed(() => {
    const url = this.currentRoute();
    return url === '/admin';
  });

  // Check if current route is dashboard
  isDashboardRoute = computed(() => {
    const url = this.currentRoute();
    return url === '/dashboard' || url === '/';
  });

  toggleSidebar = () => {
    this.sidebarOpen.update(open => !open);
  };

  toggleAdminMenu = () => {
    this.adminExpanded.update(expanded => !expanded);
  };

  constructor() {
    // Listen to route changes and update current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.url);
        // Auto-expand admin menu when on admin routes
        if (this.isAdminRoute()) {
          this.adminExpanded.set(true);
        }
      });

    // Auto-expand admin menu when on admin routes initially
    if (this.isAdminRoute()) {
      this.adminExpanded.set(true);
    }
  }

  setHoveredMenu = (menu: string | null) => {
    if (!this.sidebarOpen()) {
      this.hoveredMenu.set(menu);
    }
  };

  // Close sidebar on mobile when window is resized
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    this.isMobile.set(width < 1024);
    
    if (width < 1024 && this.sidebarOpen()) {
      // Close sidebar on mobile after resize
    } else if (width >= 1024 && !this.sidebarOpen()) {
      // Open sidebar on desktop after resize
      this.sidebarOpen.set(true);
    }
  }
}
