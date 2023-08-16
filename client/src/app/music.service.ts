import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Channel, GuildInfo, JoinGuild, PlaylistInfo, QueueInfo, QueueType, ShelfInfo, TrackInfo} from './models';
import {Observable} from 'rxjs';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Socket} from 'ngx-socket-io';
import {Title} from '@angular/platform-browser';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError} from 'rxjs/operators';
import {environment} from '../environments/environment';

export function getUrl() {
  if (environment.production) {
    return window.location.hostname + ':' + window.location.port;
  } else {
    return 'localhost:3000';
  }
}

export function getProtocol() {
  return window.location.protocol + '//';
}

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private readonly baseUrl = getProtocol() + getUrl();
  private guildId: string;
  private tracksEmitter = new EventEmitter<QueueInfo>();
  private guildEmitter = new EventEmitter<GuildInfo>();

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute,
              private socket: Socket, private titleService: Title, private snackBar: MatSnackBar) {
    this.socket.on('connect', () => {
      this.socket.fromEvent('tracks').subscribe((queueInfo: QueueInfo) => {
        this.tracksEmitter.emit(queueInfo);
      });
      this.socket.fromEvent('guild').subscribe((guild: GuildInfo) => {
        this.guildEmitter.emit(guild);
        this.guildId = guild.id;
        this.titleService.setTitle(guild.name);
      });
      this.router.events.subscribe(route => {
        if (route instanceof NavigationEnd) {
          this.handleRoute();
        }
      });
      this.handleRoute();
    });
  }

  private handleRoute() {
    let currentRoute = this.activatedRoute;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    currentRoute.paramMap.subscribe(params => {
      if (params.has('guildId')) {
        const guildId = params.get('guildId');
        const userId = params.get('userId');
        this.socket.emit('joinGuild', {guildId, oldGuildId: this.guildId, userId} as JoinGuild);
        this.guildId = guildId;
      } else {
        this.titleService.setTitle('FuckingAwesomeBot');
      }
    });
  }

  refresh() {
    if (this.guildId) {
      this.socket.emit('refresh', this.guildId);
    }
  }

  onTracks() {
    return this.tracksEmitter;
  }

  onGuild() {
    return this.guildEmitter;
  }

  queue(url: string | TrackInfo | ShelfInfo | PlaylistInfo) {
    this.play(url, 'queue');
  }

  next(url: string | TrackInfo | ShelfInfo | PlaylistInfo) {
    this.play(url, 'next');
  }

  now(url: string | TrackInfo | ShelfInfo | PlaylistInfo) {
    this.play(url, 'now');
  }

  radio(url: TrackInfo | ShelfInfo | PlaylistInfo) {
    this.play(url, 'radio');
  }

  private play(value: string | TrackInfo | ShelfInfo | PlaylistInfo, command: string) {
    if (typeof value === 'string' || value.type === 'video' || value.type === 'playlist') {
      let url: string;
      if (typeof value === 'string') {
        url = value;
      } else {
        url = value.url;
      }
      this.http.post(this.baseUrl + '/post/' + this.guildId + '/' + command, {url})
        .pipe(this.handleError()).subscribe();
    } else {
      this.http.post(this.baseUrl + '/' + this.guildId + '/' + command, {tracks: value.items}).pipe(this.handleError()).subscribe();
    }
  }


  skip() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/skip').pipe(this.handleError()).subscribe();
  }

  skipBack() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/skipBack').pipe(this.handleError()).subscribe();
  }

  seek(seconds: number) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/seek/' + encodeURIComponent(seconds)).pipe(this.handleError()).subscribe();
  }

  setVolume(volume: number) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/volume/' + encodeURIComponent(volume)).pipe(this.handleError()).subscribe();
  }

  restart() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/restart').pipe(this.handleError()).subscribe();
  }

  togglePause() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/togglePause').pipe(this.handleError()).subscribe();
  }

  toggleRepeat() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/toggleRepeat').pipe(this.handleError()).subscribe();
  }

  toggleAutoRadio() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/toggleRadio').pipe(this.handleError()).subscribe();
  }

  remove(id: number) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/remove/' + id).pipe(this.handleError()).subscribe();
  }

  search(query: string): Observable<(TrackInfo | ShelfInfo | PlaylistInfo)[]> {
    return this.http.post(this.baseUrl + '/post/search', {query})
      .pipe(this.handleError()) as Observable<(TrackInfo | ShelfInfo)[]>;
  }

  getChannels(): Observable<Channel[]> {
    return this.http.get(this.baseUrl + '/' + this.guildId + '/channels').pipe(this.handleError()) as Observable<Channel[]>;
  }

  join(id: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/join/' + id).pipe(this.handleError()).subscribe();
  }

  leave() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/leave/').pipe(this.handleError()).subscribe();
  }

  add(queue: QueueType, track: TrackInfo | ShelfInfo | PlaylistInfo, index: number) {
    let body: any;
    if (track.type === 'playlist') {
      this.http.post(this.baseUrl + '/post/' + this.guildId + '/add/' + queue + '/' + index, {url: track.url})
        .pipe(this.handleError()).subscribe();
      return;
    } else if (track.type === 'video') {
      body = track;
    } else {
      body = track.items;
    }
    this.http.post(this.baseUrl + '/' + this.guildId + '/add/' + queue + '/' + index, {value: body}).pipe(this.handleError()).subscribe();
  }

  move(queue: QueueType, id: number, index: number) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/move/' + queue + '/' + id + '/' + index).pipe(this.handleError()).subscribe();
  }

  clearPlaylist() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/clear').pipe(this.handleError()).subscribe();
  }

  getGuilds(): Observable<GuildInfo[]> {
    return this.http.get(this.baseUrl + '/guilds/get').pipe(this.handleError()) as Observable<GuildInfo[]>;
  }

  getPlaylistTracks(url: string): Observable<TrackInfo[]> {
    return this.http.post(this.baseUrl + '/post/playlist/items', {url})
      .pipe(this.handleError()) as Observable<TrackInfo[]>;
  }

  private handleError() {
    return catchError(err => {
        let message: string;
        if (err.error && err.error.message) {
          message = err.error.message;
        } else {
          message = err.message;
        }
        console.log(message);
        this.snackBar.open(message, null, {
          duration: 3000,
          panelClass: 'error'
        });
        throw err;
      }
    );
  }
}
