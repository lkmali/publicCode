import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";

@Component({
    selector: 'app-pagination',
    templateUrl: 'pagination.component.html'
})
export class Pagination implements OnInit {
    
    filter: any;
    CurrentPage: any = 1;
    
    @Input()
    pageSize: number;
    @Input()
    totalItems: number;

    @Output()
    onPageChange = new EventEmitter();
    
    constructor() {}

    ngOnInit(): void {
        this.filter = { pageIndex: 1, pageSize: 10 };
        if (this.pageSize) this.filter.pageSize = this.pageSize;
    }

    filterChanged(refilter) {
        if (refilter == false) {
            this.filter.pageIndex = this.CurrentPage;
        }
        this.onPageChange.emit(this.filter);
    }
}