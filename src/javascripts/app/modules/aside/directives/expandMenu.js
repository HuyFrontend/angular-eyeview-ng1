import jQuery from 'jquery';
let directive = function ($timeout,
                          $rootScope) {
  'ngInject';
  return {
    restrict: 'A',
    link: function (scope, elem) {
      // accordion menu
      jQuery(document)
        .off('click', '.side_menu_expanded #main_menu li.first_level:not(.has_submenu) > a:not(.no-active)')
        .on('click', '.side_menu_expanded #main_menu li.first_level:not(.has_submenu) > a:not(.no-active)', function () {
          var $this_parent = jQuery(this).parent('li.first_level');
          $this_parent.siblings().removeClass('section_active').children('ul').slideUp('200');
          $this_parent.addClass('section_active');
        })
        .off('click', '.side_menu_expanded #main_menu .has_submenu > a')
        .on('click', '.side_menu_expanded #main_menu .has_submenu > a', function () {
          if (jQuery(this).parent('.has_submenu').hasClass('first_level')) {
            var $this_parent = jQuery(this).parent('.has_submenu'),
              panel_active = $this_parent.hasClass('section_active');

            if (!panel_active) {
              $this_parent.siblings().removeClass('section_active').children('ul').slideUp('200');
              $this_parent.addClass('section_active').children('ul').slideDown('200');
            } else {
              $this_parent.removeClass('section_active').children('ul').slideUp('200');
            }
          } else {
            var $submenu_parent = jQuery(this).parent('.has_submenu'),
              submenu_active = $submenu_parent.hasClass('submenu_active');

            if (!submenu_active) {
              $submenu_parent.siblings().removeClass('submenu_active').children('ul').slideUp('200');
              $submenu_parent.addClass('submenu_active').children('ul').slideDown('200');
            } else {
              $submenu_parent.removeClass('submenu_active').children('ul').slideUp('200');
            }
          }

          $rootScope.$broadcast('malihuScrollBar.update');
        });

      scope.$on('$destroy', function () {
        jQuery(document)
          .off('click', '.side_menu_expanded #main_menu .has_submenu > a');
      });
    }
  };
};

export default directive;