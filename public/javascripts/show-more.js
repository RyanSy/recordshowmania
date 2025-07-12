$(document).ready(function() {
    $('.show:gt(20)').hide().last().after(
        $('<div class="mt-3 pt-3 text-center"><input type="button" class="btn btn-success" value="Show More" /></div>').click(function() {
            $('.show:not(:visible):lt(20)').show();
            if ($('.show:not(:visible)').length == 0) {
                $(this).hide();
            }            
        })
    );
});